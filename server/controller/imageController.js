const User = require('../models/User');
const Image = require('../models/Image');
const nodemailer = require('nodemailer');

exports.uploadImage = async (req, res) => {
  const userId = req.user.id; // from auth middleware

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the user has an active plan
    if (!user.plan) {
      return res.status(403).json({ message: 'Please purchase a plan to generate images.' });
    }

    // Check if the user has remaining image generation quota
    if (user.subscription.imagesRemaining <= 0) {
      return res.status(403).json({ message: 'Image generation quota exceeded for your plan.' });
    }

    // Validate the presence of the image in the request body
    const base64Image = req.body.image;
    if (!base64Image) {
      return res.status(400).json({ message: 'Image is required in base64 format.' });
    }

    // Create a new image record in the database
    const newImage = new Image({
      user: userId,
      name: req.body.name || 'Uploaded Image',
      prompt: req.body.prompt || '',
      originalImageUrl: base64Image,
      status: 'processing',
    });

    await newImage.save();

    // Decrease the user's remaining quota
    user.subscription.imagesRemaining -= 1;
    await user.save();

    // Send the response immediately
    res.status(200).json({
      message: 'Image uploaded successfully! Processing has started.',
      imageId: newImage._id,
    });

    // Simulate image generation (replace this with actual image processing logic)
    setTimeout(async () => {
      try {
        newImage.generatedImageUrl = `data:image/png;base64,${base64Image}`; // Simulated generated image
        newImage.status = 'completed';
        newImage.completedAt = new Date();
        await newImage.save();

        // Send email notification (configure nodemailer)
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Your Ghibli Image is Ready!',
          text: 'Your generated image is ready. Please check your account.',
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
          } else {
            console.log('Email sent:', info.response);
          }
        });
      } catch (error) {
        console.error('Error during image generation:', error);
      }
    }, 5000); // Simulate a delay of 5 seconds for image generation
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

exports.getGeneratedImages = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch all images for the authenticated user
    const images = await Image.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({ generatedImages: images });
  } catch (error) {
    console.error('Error retrieving generated images:', error);
    res.status(500).json({ message: 'Error retrieving generated images', error: error.message });
  }
};

exports.triggerImageGeneration = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.plan) {
      return res.status(403).json({ message: 'Please purchase a plan to generate images.' });
    }

    // Simulate triggering image generation
    res.status(200).json({ message: 'Image generation triggered successfully!' });
  } catch (error) {
    console.error('Error triggering image generation:', error);
    res.status(500).json({ message: 'Error triggering image generation', error: error.message });
  }
};
