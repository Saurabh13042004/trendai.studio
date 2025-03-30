const express = require('express');
const { uploadImage, getGeneratedImages } = require('../controller/imageController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload', authMiddleware, upload.single('image'), uploadImage);
router.get('/generated', authMiddleware, getGeneratedImages);

module.exports = router;
