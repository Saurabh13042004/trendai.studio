const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide an image name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  prompt: {
    type: String,
    trim: true,
    maxlength: [500, 'Prompt cannot be more than 500 characters']
  },
  originalImageUrl: {
    type: String,
    required: [true, 'Original image URL is required']
  },
  generatedImageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  processingStartTime: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
ImageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Image', ImageSchema);