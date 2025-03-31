const express = require('express');
const {
  uploadImage,
  getGeneratedImages,
  triggerImageGeneration,
} = require('../controller/imageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Upload an image in base64 format
router.post('/upload', authMiddleware, uploadImage);

// Get all generated images for the authenticated user
router.get('/generated', authMiddleware, getGeneratedImages);

// Trigger image generation
router.post('/generate', authMiddleware, triggerImageGeneration);

module.exports = router;
