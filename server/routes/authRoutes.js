const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/limiter');

// Apply rate limiting to authentication routes
router.use(authLimiter);

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.get('/logout', protect, authController.logout);

module.exports = router;