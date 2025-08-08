const Product = require('../models/product');

const imageKit = require('../imageKit/index');
const { uploadToImageKit } = require('../imageKit');

module.exports.index = async (req, res) => {
    const { category, search } = req.query;
    let filter = {};
    if (category) {
        filter.category = category;
    }
    if (search) {
        const regex = new RegExp(search, 'i'); // case-insensitive
        filter.$or = [
            { title: regex },
            { description: regex }
        ];
    }
    const products = await Product.find(filter)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        });
    res.render('products/index', { products, category, search });
}

module.exports.renderNewForm = (req, res) => {
    res.render('products/new');
}

module.exports.createProduct = async (req, res) => {
    const product = new Product(req.body.product);
    product.author = req.user._id;

    const images = [];
    for (let file of req.files) {
        const uploaded = await uploadToImageKit(file);
        images.push({
            url: uploaded.url,
            filename: uploaded.fileId
        });
    }

    product.images = images;
    await product.save();

    req.flash('success', 'تمت إضافة المنتج بنجاح!');
    res.redirect(`/products/${product._id}`);
}

module.exports.showProduct = async (req, res) => {
    const product = await Product.findById(req.params.id).populate('author').populate({
        path: 'reviews',
        populate: { path: 'author' }
    });
    res.render('products/show', { product });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        req.flash('error', 'لا يمكن ايجاد هذا المنتج!');
        return res.redirect('/products');
    }
    console.log(product.images);
    res.render('products/edit', { product });
}

module.exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product });
    const uploadedImages = await Promise.all(
        req.files.map(file => uploadToImageKit(file))
    );
    const imgs = uploadedImages.map(img => ({
        url: img.url,
        filename: img.name,
        fileId: img.fileId
    }));
    product.images.push(...imgs);
    await product.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            const image = product.images.find(img => img.filename === filename);
            if (image && image.fileId) {
                try {
                    await imageKit.imagekit.deleteFile(image.fileId);
                } catch (err) {
                    console.error(`❌ فشل حذف الصورة من ImageKit: ${filename}`, err.message);
                }
            }
        }
        await product.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'تم تحديث المنتج بنجاح!');
    res.redirect(`/products/${product._id}`);
}

module.exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    req.flash('success', 'تم حذف المنتج بنجاح!');
    res.redirect('/products');
}
