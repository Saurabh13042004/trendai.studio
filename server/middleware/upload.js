const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const imageService = require('../services/imageService');

// Set up storage for temporary file storage
const storage = multer.memoryStorage();

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter
});

// Add Firebase upload middleware
const firebaseUpload = async (req, res, next) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return next();
    }

    // Generate unique filename
    const filename = `${uuidv4()}${path.extname(req.file.originalname || '.jpg')}`;
    
    // Upload to Firebase Storage
    const imageUrl = await imageService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      'originals'
    );
    
    // Add location to the file object
    req.file.location = imageUrl;
    
    next();
  } catch (error) {
    next(error);
  }
};

// Combine both middlewares
const processUpload = (fieldName) => {
  return [upload.single(fieldName), firebaseUpload];
};

module.exports = upload;
module.exports.processUpload = processUpload;