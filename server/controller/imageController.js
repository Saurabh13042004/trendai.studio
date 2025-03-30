const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.uploadImage = async (req, res) => {
  const userId = req.user.id; // from auth middleware

  try {
    // Check user's plan and limit image generation accordingly
    const user = await User.findById(userId);
    if (!user.plan) {
      return res.status(403).json({ message: 'Please purchase a plan to generate images.' });
    }

    // Check if the user has remaining image generation quota
    if (user.subscription.imagesRemaining <= 0) {
      return res.status(403).json({ message: 'Image generation quota exceeded for your plan.' });
    }

    // Store the uploaded image in base64 format
    const base64Image = req.body.image; // Assuming the image is sent as a base64 string in the request body
    if (!base64Image) {
      return res.status(400).json({ message: 'Image is required in base64 format.' });
    }

    const generatedImageUrl = `data:image/png;base64,${base64Image}`; // Simulated generated image

    // Save the generated image URL to the user's record
    user.generatedImages.push({ url: generatedImageUrl });
    user.subscription.imagesRemaining -= 1; // Decrease the remaining quota
    await user.save();

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

    res.status(200).json({ message: 'Image generated successfully!', generatedImageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

exports.getGeneratedImages = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ generatedImages: user.generatedImages });
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
