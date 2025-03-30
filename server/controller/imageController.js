const Image = require('../models/Image');
const User = require('../models/User');
const imageService = require('../services/imageService');
const emailService = require('../services/emailService');
const { s3 } = require('../config/storage');

// @desc    Upload and generate Ghibli-style image
// @route   POST /api/images/generate
// @access  Private
exports.generateImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const { prompt = '' } = req.body;
    const imageName = req.body.name || `Ghibli Art ${Date.now()}`;
    
    // Get user to check subscription
    const user = await User.findById(req.user.id);
    
    // Ensure user has images remaining in their subscription
    if (user.subscription.imagesRemaining <= 0) {
      return res.status(403).json({
        success: false,
        message: 'You have used all your image generations. Please upgrade your plan.',
        requiresSubscription: true
      });
    }
    
    // Decrement images remaining count
    user.subscription.imagesRemaining--;
    await user.save();
    
    // Create a new image record
    const newImage = await Image.create({
      user: req.user.id,
      name: imageName,
      prompt,
      originalImageUrl: req.file.location,
      status: 'processing',
    });
    
    // Respond immediately to client with the queued status
    res.status(202).json({
      success: true,
      message: 'Image processing started. You will receive an email when it is ready.',
      data: {
        id: newImage._id,
        name: newImage.name,
        status: newImage.status,
        originalImageUrl: newImage.originalImageUrl,
        createdAt: newImage.createdAt
      }
    });
    
    // Process image asynchronously (in a real app this would likely be a message queue)
    try {
      // Queue the image processing job
      // For demonstration purposes, we'll use setTimeout to simulate processing delay
      // In a real app, you'd use a job queue like Bull or a serverless function
      setTimeout(async () => {
        try {
          // Process the image (this is where your AI model would be called)
          const generatedImageUrl = await imageService.processImage(
            newImage.originalImageUrl,
            prompt
          );
          
          // Update the image status and URL in the database
          newImage.status = 'completed';
          newImage.generatedImageUrl = generatedImageUrl;
          newImage.completedAt = new Date();
          await newImage.save();
          
          // Send email notification
          await emailService.sendImageGenerationCompleted(
            user.email,
            user.name,
            newImage.name,
            generatedImageUrl
          );
        } catch (processError) {
          // Handle processing failure
          newImage.status = 'failed';
          await newImage.save();
          
          // Refund the image credit to the user
          user.subscription.imagesRemaining++;
          await user.save();
          
          // Send failure notification
          await emailService.sendImageGenerationFailed(
            user.email,
            user.name,
            newImage.name
          );
          
          console.error('Image processing failed:', processError);
        }
      }, 15 * 60 * 1000); // 15 minutes delay to simulate processing time
    } catch (queueError) {
      console.error('Failed to queue image processing job:', queueError);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process image generation request',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get all images for the logged-in user
// @route   GET /api/images
// @access  Private
exports.getUserImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const images = await Image.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    const totalImages = await Image.countDocuments({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: images.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalImages / limit),
        total: totalImages
      },
      data: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve images',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get a single image by ID
// @route   GET /api/images/:id
// @access  Private
exports.getImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Check if the image belongs to the logged-in user
    if (image.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this image'
      });
    }
    
    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve image',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Delete an image
// @route   DELETE /api/images/:id
// @access  Private
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Check if the image belongs to the logged-in user
    if (image.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this image'
      });
    }
    
    // Delete image files from S3
    if (image.originalImageUrl) {
      const originalKey = new URL(image.originalImageUrl).pathname.slice(1);
      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: originalKey
      });
    }
    
    if (image.generatedImageUrl) {
      const generatedKey = new URL(image.generatedImageUrl).pathname.slice(1);
      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: generatedKey
      });
    }
    
    // Delete image from database
    await image.remove();
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};