const express = require('express');
const router = express.Router();
const imageController = require('../controller/imageController');
const { protect } = require('../middleware/auth');
const { imageLimiter } = require('../middleware/limiter');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Apply rate limiting to image generation
router.post('/generate', imageLimiter, upload.single('image'), imageController.generateImage);

// Get user's images
router.get('/', imageController.getUserImages);

// Get single image
router.get('/:id', imageController.getImage);

// Delete image
router.delete('/:id', imageController.deleteImage);

module.exports = router;