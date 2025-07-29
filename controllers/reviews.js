const Perfume = require('../models/perfume');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const perfume = await Perfume.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    perfume.reviews.push(review);
    await review.save();
    await perfume.save();
    req.flash('success', 'تمت إضافة المراجعة بنجاح!');
    res.redirect(`/perfumes/${perfume._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Perfume.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'تم حذف المراجعة بنجاح!');
    res.redirect(`/perfumes/${id}`);
}
