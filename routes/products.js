const express = require('express');
const router = express.Router();
const { isLoggedIn, isAuthor, validateProduct } = require('../middleware.js'); // تغيير هنا
const { upload, uploadToImageKit } = require('../imageKit');
const multer = require('multer');

const Product = require('../models/product'); // تغيير هنا

const products = require('../controllers/products.js'); // تغيير هنا
const catchAsync = require('../utils/catchAsync');

router.route('/')
    .get(catchAsync(products.index))
    .post(isLoggedIn, upload.array('image'), validateProduct, catchAsync(products.createProduct)); // تغيير هنا

router.get('/new', isLoggedIn, products.renderNewForm);

router.route('/:id')
    .get(catchAsync(products.showProduct)) // تغيير هنا
    .put(isLoggedIn, isAuthor, upload.array('image'), validateProduct, catchAsync(products.updateProduct)) // تغيير هنا
    .delete(isLoggedIn, isAuthor, catchAsync(products.deleteProduct)); // تغيير هنا

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(products.renderEditForm));

module.exports = router;