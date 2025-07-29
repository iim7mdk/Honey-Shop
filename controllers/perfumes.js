const Perfume = require('../models/perfume');

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
    const perfumes = await Perfume.find(filter)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
    res.render('perfumes/index', { perfumes, category, search });
}


module.exports.renderNewForm = (req, res) => {
    res.render('perfumes/new');
}

module.exports.createPerfume = async (req, res) => {
    const perfume = new Perfume(req.body.perfume);
    perfume.author = req.user._id;

    const images = [];
    for (let file of req.files) {
        const uploaded = await uploadToImageKit(file);
        images.push({
            url: uploaded.url,
            filename: uploaded.fileId
        });
    }

    perfume.images = images;
    await perfume.save();

    req.flash('success', 'successfuly added the Perfume!');
    res.redirect(`/perfumes/${perfume._id}`);
}


module.exports.showPerfume = async (req, res) => {
    const perfume = await Perfume.findById(req.params.id).populate('author').populate({
        path: 'reviews',
        populate: { path: 'author' }
    });
    res.render('perfumes/show', { perfume });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const perfume = await Perfume.findById(id);
    if (!perfume) {
        req.flash('error', 'Cannot find that perfume!');
        return res.redirect('/perfumes');
    }
    console.log(perfume.images);
    res.render('perfumes/edit', { perfume });
}

module.exports.updatePerfume = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const perfume = await Perfume.findByIdAndUpdate(id, { ...req.body.perfume });
    const uploadedImages = await Promise.all(
        req.files.map(file => uploadToImageKit(file))
    );
    const imgs = uploadedImages.map(img => ({
        url: img.url,
        filename: img.name,
        fileId: img.fileId
    }));
    perfume.images.push(...imgs);
    await perfume.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            const image = perfume.images.find(img => img.filename === filename);
            if (image && image.fileId) {
                try {
                    await imageKit.imagekit.deleteFile(image.fileId);
                } catch (err) {
                    console.error(`❌ فشل حذف الصورة من ImageKit: ${filename}`, err.message);
                }
            }
        }
        await perfume.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        // console.log(perfume);
    }
    req.flash('success', 'successfully updated perfume!');
    res.redirect(`/perfumes/${perfume._id}`);
}

module.exports.deletePerfume = async (req, res) => {
    const { id } = req.params;
    await Perfume.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted perfume');
    res.redirect('/perfumes');
}
