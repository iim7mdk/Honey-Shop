const express = require('express');
const router = express.Router();
const { isLoggedIn, isAuthor, validatePerfume } = require('../middleware.js');
const { upload, uploadToImageKit } = require('../imageKit');
const multer = require('multer');

const Perfume = require('../models/perfume');

const perfumes = require('../controllers/perfumes.js');
const catchAsync = require('../utils/catchAsync');


router.route('/')
    .get(catchAsync(perfumes.index))
    .post(isLoggedIn, upload.array('image'), validatePerfume, catchAsync(perfumes.createPerfume));


router.get('/new', isLoggedIn, perfumes.renderNewForm);

router.route('/:id')
    .get(catchAsync(perfumes.showPerfume))
    .put(isLoggedIn, isAuthor, upload.array('image'), validatePerfume, catchAsync(perfumes.updatePerfume))
    .delete(isLoggedIn, isAuthor, catchAsync(perfumes.deletePerfume));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(perfumes.renderEditForm));



module.exports = router;

