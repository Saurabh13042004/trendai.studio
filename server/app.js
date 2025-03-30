// app.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const firebaseAdmin = require('firebase-admin');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const path = require('path');

// Load environment variables (in production, use a package like dotenv)
const JWT_SECRET = 'your_jwt_secret_here'; // Replace with env var in production
const PORT = process.env.PORT || 3000;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------
// Firebase Admin Setup
// ---------------------
// Replace './path/to/serviceAccountKey.json' with the path to your Firebase service account key
const serviceAccount = require('./path/to/serviceAccountKey.json');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  storageBucket: "your-firebase-bucket-url" // e.g. "your-app.appspot.com"
});
const bucket = firebaseAdmin.storage().bucket();

// ---------------------
// Razorpay Setup
// ---------------------
const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',
  key_secret: 'YOUR_RAZORPAY_KEY_SECRET'
});

// ---------------------
// Nodemailer Setup
// ---------------------
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

// ---------------------
// Multer Setup for File Uploads
// ---------------------
const upload = multer({ dest: 'uploads/' });

// ---------------------
// In-Memory "Database"
// ---------------------
// In a real application, use a persistent database.
const users = []; // Each user: { id, email, password, plan, imagesGenerated, generatedImages, chatHistory }

// ---------------------
// Middleware for Authentication using JWT
// ---------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
}

// ---------------------
// Routes
// ---------------------

// User Registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser)
    return res.status(400).json({ message: "User already exists." });

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    email,
    password: hashedPassword,
    plan: null,           // No plan purchased yet
    imagesGenerated: 0,   // Count of generated images
    generatedImages: [],  // URLs of generated images
    chatHistory: []       // Chat messages
  };
  users.push(newUser);
  res.status(201).json({ message: "User registered successfully." });
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user)
    return res.status(400).json({ message: "User not found." });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Invalid password." });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Purchase Plan (Order Creation using Razorpay)
app.post('/purchase', authenticateToken, async (req, res) => {
  const { plan } = req.body;
  if (!plan || (plan !== 'basic' && plan !== 'premium'))
    return res.status(400).json({ message: "Invalid plan selected." });

  // Determine amount in paise (INR * 100)
  let amount = 0;
  if (plan === 'basic') amount = 50 * 100;     // 50 INR plan (2 images allowed)
  else if (plan === 'premium') amount = 100 * 100; // 100 INR plan (5 images allowed)

  const options = {
    amount: amount,
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    // In production, you would store the order details and verify payment signature later.
    res.json({ order, message: "Order created. Please complete the payment to activate your plan." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating order." });
  }
});

// Payment Verification Callback (Simulated)
app.post('/payment-verification', authenticateToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  // NOTE: You must verify the payment signature using Razorpay's library/methods.
  // For demonstration, we assume payment is verified successfully.
  const user = users.find(u => u.id === req.user.id);
  if (!user)
    return res.status(404).json({ message: "User not found." });

  // Activate the user’s plan and reset the image generation counter.
  user.plan = plan;
  user.imagesGenerated = 0;
  res.json({ message: "Payment verified and plan activated." });
});

// Upload Image and Trigger Generation Process
app.post('/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user)
    return res.status(404).json({ message: "User not found." });
  if (!user.plan)
    return res.status(403).json({ message: "Please purchase a plan to generate images." });

  // Determine allowed quota based on plan
  let quota = user.plan === 'basic' ? 2 : user.plan === 'premium' ? 5 : 0;
  if (user.imagesGenerated >= quota)
    return res.status(403).json({ message: "Image generation quota exceeded for your plan." });

  // Start image processing simulation (15 minutes delay)
  res.json({ message: "Image is being processed. You will receive an email once it is generated (approx 15 mins)." });

  setTimeout(async () => {
    // Simulate generated image URL (in real case, integrate your image generation logic)
    const generatedImageUrl = `https://your-cdn.com/generated/${Date.now()}.png`;

    // (Optional) Upload the generated image file to Firebase Storage here.
    // For demo, we simply add the URL to the user's record.
    user.generatedImages.push(generatedImageUrl);
    user.imagesGenerated += 1;

    // Send email notification to the user
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Your generated image is ready',
      text: `Your image has been generated. You can view it here: ${generatedImageUrl}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }, 15 * 60 * 1000); // 15 minutes delay
});

// Retrieve Previously Generated Images
app.get('/generated-images', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user)
    return res.status(404).json({ message: "User not found." });
  res.json({ generatedImages: user.generatedImages });
});

// Chat Support - Send a Message
app.post('/chat', authenticateToken, (req, res) => {
  const { message } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user)
    return res.status(404).json({ message: "User not found." });

  const chatMessage = {
    message,
    timestamp: new Date()
  };
  user.chatHistory.push(chatMessage);
  res.json({ message: "Message received. Our support team will contact you soon." });
});

// Chat Support - Retrieve Chat History
app.get('/chat', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user)
    return res.status(404).json({ message: "User not found." });
  res.json({ chatHistory: user.chatHistory });
});

// ---------------------
// Start the Server
// ---------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
