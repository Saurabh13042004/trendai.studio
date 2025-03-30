const express = require('express');
const router = express.Router();
const supportController = require('../controller/supportController');
const { protect, authorize } = require('../middleware/auth');
const { supportLimiter } = require('../middleware/limiter');

// All routes are protected
router.use(protect);

// User routes
router.post('/tickets', supportLimiter, supportController.createSupportTicket);
router.get('/tickets', supportController.getUserTickets);
router.get('/tickets/:id', supportController.getTicket);
router.post('/tickets/:id/messages', supportController.addMessage);
router.put('/tickets/:id/close', supportController.closeTicket);

// Admin routes
router.get(
  '/admin/tickets', 
  authorize('admin'), 
  supportController.getAllTickets
);

module.exports = router;