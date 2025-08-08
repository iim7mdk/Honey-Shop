const { productSchema, reviewSchema } = require('./schemas.js'); // Joi schemas
const ExpressError = require('./utils/expressError.js');
const Product = require('./models/product'); // تغيير هنا
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'يجب عليك تسجيل الدخول أولاً!');
        return res.redirect('/login');
    }
    next();
};

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.validateProduct = (req, res, next) => { // تغيير اسم الدالة
    const { error } = productSchema.validate(req.body); // تغيير هنا
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id); // تغيير هنا
    if (!product.author.equals(req.user._id)) {
        req.flash('error', 'ليس لديك صلاحية لتعديل هذا المنتج!'); // تغيير الرسالة
        return res.redirect(`/products/${id}`); // تغيير المسار
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'ليس لديك صلاحية لحذف هذا التعليق!');
        return res.redirect(`/products/${id}`); // تغيير المسار
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

