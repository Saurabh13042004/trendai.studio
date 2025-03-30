const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Get available plans (public)
router.get('/plans', paymentController.getPlans);

// Protected routes
router.use(protect);

// User routes
router.post('/create-session', paymentController.createPaymentSession);
router.get('/subscription', paymentController.getUserSubscription);
router.get('/can-generate', paymentController.canGenerateImage);

// Admin routes
router.get(
  '/admin/subscriptions', 
  authorize('admin'), 
  paymentController.getAllSubscriptions
);
router.post(
  '/admin/add-subscription', 
  authorize('admin'), 
  paymentController.addSubscription
);

// Webhook route (public but secured by webhook secret verification)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handlePaymentWebhook
);

module.exports = router;