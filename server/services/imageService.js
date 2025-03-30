const { initializeApp } = require('firebase/app');
const { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} = require('firebase/storage');
const fetch = require('node-fetch');
const uuid = require('uuid').v4;
const path = require('path');
const sharp = require('sharp');

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

/**
 * Process image and generate Ghibli-style image
 * @param {String} imageUrl - URL of the original image
 * @param {String} prompt - User prompt for image generation
 * @returns {Promise<String>} - URL of the generated image
 */
exports.processImage = async (imageUrl, prompt) => {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer();
    
    // In a real application, you'd send this to an AI service
    // For this example, we'll just apply some image processing to simulate
    
    // Use sharp to add a watercolor-like effect (simulating Ghibli style)
    const processedBuffer = await sharp(imageBuffer)
      .modulate({ saturation: 1.5, brightness: 1.1 })
      .sharpen()
      .gamma(1.1)
      .toBuffer();
    
    // Upload processed image to Firebase Storage
    const filename = `generated_${uuid()}${path.extname(new URL(imageUrl).pathname)}`;
    const storageRef = ref(storage, `generated/${filename}`);
    
    // Upload the processed image
    const snapshot = await uploadBytes(storageRef, processedBuffer, {
      contentType: 'image/jpeg', // Adjust based on your image type
      metadata: {
        firebaseStorageDownloadTokens: uuid(),
        prompt: prompt || ''
      }
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Delete an image from Firebase Storage
 * @param {String} imageUrl - URL of the image to delete
 * @returns {Promise<void>}
 */
exports.deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extract the path from the URL
    const imagePath = decodeURIComponent(new URL(imageUrl).pathname.split('/o/')[1].split('?')[0]);
    const imageRef = ref(storage, imagePath);
    
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Upload an image to Firebase Storage
 * @param {Buffer} buffer - Image buffer
 * @param {String} filename - Original filename
 * @param {String} folder - Storage folder
 * @returns {Promise<String>} - Download URL
 */
exports.uploadImage = async (buffer, filename, folder = 'uploads') => {
  try {
    const safeFilename = `${uuid()}_${path.basename(filename)}`;
    const storageRef = ref(storage, `${folder}/${safeFilename}`);
    
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: `image/${path.extname(filename).slice(1)}`,
      metadata: {
        firebaseStorageDownloadTokens: uuid()
      }
    });
    
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image');
  }
};