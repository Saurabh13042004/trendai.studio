const bucket = require('../config/firebase');
const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.uploadImage = async (req, res) => {
  const userId = req.user.id; // from auth middleware

  // Check user's plan and limit image generation accordingly
  const user = await User.findById(userId);
  
  if (!user.plan) {
    return res.status(403).send('Please purchase a plan to generate images.');
  }

  // Logic to handle image processing (e.g., call an external API to generate Ghibli style)
  
  // Simulate image generation delay and sending email notification
  setTimeout(async () => {
    const imageUrl = 'generated-image-url'; // URL after processing
    
    // Save the generated image URL to the user's record in Firebase Storage.
    await bucket.upload(req.file.path);
    
    user.generatedImages.push({ url: imageUrl });
    await user.save();
    
    // Send email notification (configure nodemailer)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Ghibli Image is Ready!',
      text: `Your generated image is available at ${imageUrl}`,
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Image generated and email sent!', imageUrl });
    
  }, 900000); // Simulate a delay of ~15 minutes for image generation.
};

exports.getGeneratedImages = async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findById(userId);
  
  res.status(200).json(user.generatedImages);
};
