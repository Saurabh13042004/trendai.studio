const SupportChat = require('../models/SupportChat');
const User = require('../models/User');
const emailService = require('../services/emailService');

// @desc    Create a new support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.createSupportTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and message'
      });
    }
    
    // Create new support ticket
    const ticket = await SupportChat.create({
      user: req.user.id,
      subject,
      messages: [
        {
          sender: 'user',
          message,
          timestamp: Date.now()
        }
      ],
      status: 'open'
    });
    
    // Notify admin via email
    await emailService.sendNewSupportTicketNotification(
      subject,
      message,
      req.user.email,
      req.user.name,
      ticket._id
    );
    
    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get all support tickets for the logged-in user
// @route   GET /api/support/tickets
// @access  Private
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportChat.find({ user: req.user.id })
      .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve support tickets',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get a single support ticket
// @route   GET /api/support/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await SupportChat.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    // Check if ticket belongs to user or user is admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this ticket'
      });
    }
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve support ticket',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Add message to support ticket
// @route   POST /api/support/tickets/:id/messages
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }
    
    let ticket = await SupportChat.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    // Check if ticket belongs to user or user is admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this ticket'
      });
    }
    
    // Add message to ticket
    const newMessage = {
      sender: req.user.role === 'admin' ? 'admin' : 'user',
      message,
      timestamp: Date.now()
    };
    
    ticket.messages.push(newMessage);
    
    // If admin is responding, update status to 'in-progress'
    if (req.user.role === 'admin' && ticket.status === 'open') {
      ticket.status = 'in-progress';
    }
    
    // If ticket was closed and user adds message, reopen it
    if (ticket.status === 'closed') {
      ticket.status = 'reopened';
    }
    
    await ticket.save();
    
    // Notify the other party via email
    if (req.user.role === 'admin') {
      // Admin replied, notify user
      const user = await User.findById(ticket.user);
      if (user) {
        await emailService.sendTicketReplyNotification(
          user.email,
          user.name,
          ticket.subject,
          message,
          ticket._id
        );
      }
    } else {
      // User replied, notify admin
      await emailService.sendTicketUpdatedNotification(
        ticket.subject,
        message,
        req.user.email,
        req.user.name,
        ticket._id
      );
    }
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Close a support ticket
// @route   PUT /api/support/tickets/:id/close
// @access  Private
exports.closeTicket = async (req, res) => {
  try {
    const ticket = await SupportChat.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    // Check if ticket belongs to user or user is admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this ticket'
      });
    }
    
    ticket.status = 'closed';
    await ticket.save();
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to close support ticket',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Admin: Get all support tickets
// @route   GET /api/support/admin/tickets
// @access  Admin
exports.getAllTickets = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const tickets = await SupportChat.find(filter)
      .sort({ updatedAt: -1 })
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve support tickets',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};