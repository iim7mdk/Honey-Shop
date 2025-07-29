const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

const reviews = require('../controllers/reviews');

// إضافة مراجعة
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// حذف مراجعة
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;

