const User = require('../models/User');
const Subscription = require('../models/Subscription');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');

// Plan configurations
const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 50,
    currency: 'INR',
    imagesLimit: 2,
    description: 'Generate up to 2 magical Ghibli-style images'
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: 100,
    currency: 'INR',
    imagesLimit: 5,
    description: 'Generate up to 5 magical Ghibli-style images with priority processing'
  }
};

// @desc    Get available subscription plans
// @route   GET /api/payments/plans
// @access  Public
exports.getPlans = (req, res) => {
  res.status(200).json({
    success: true,
    data: Object.values(PLANS)
  });
};

// @desc    Create payment session for subscription
// @route   POST /api/payments/create-session
// @access  Private
exports.createPaymentSession = async (req, res) => {
  try {
    const { planId } = req.body;
    
    // Validate plan
    if (!PLANS[planId]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }
    
    const plan = PLANS[planId];
    
    // Create payment session (e.g., with Razorpay, Stripe, etc.)
    const session = await paymentService.createSession({
      amount: plan.price,
      currency: plan.currency,
      metadata: {
        userId: req.user.id,
        planId: planId
      }
    });
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Process successful payment webhook
// @route   POST /api/payments/webhook
// @access  Public (secured by webhook secret)
exports.handlePaymentWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const event = await paymentService.verifyWebhookSignature(
      req.body,
      req.headers['x-razorpay-signature']
    );
    
    // Early response for webhook
    res.status(200).send({ received: true });
    
    // Process based on event type
    if (event.type === 'payment.captured' || event.type === 'payment.success') {
      const paymentData = event.data;
      const metadata = paymentData.metadata || {};
      
      // Extract user and plan info
      const { userId, planId } = metadata;
      
      if (!userId || !planId) {
        console.error('Missing user or plan information in payment metadata');
        return;
      }
      
      // Get plan details
      const plan = PLANS[planId];
      if (!plan) {
        console.error(`Invalid plan: ${planId}`);
        return;
      }
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        console.error(`User not found: ${userId}`);
        return;
      }
      
      // Create or update subscription
      const subscription = await Subscription.findOneAndUpdate(
        { user: userId },
        {
          plan: planId,
          imagesLimit: plan.imagesLimit,
          imagesGenerated: 0,
          active: true,
          paymentId: paymentData.id,
          startDate: new Date(),
          // Subscriptions don't expire based on time but on image usage
        },
        { upsert: true, new: true }
      );
      
      // Update user with subscription info
      user.hasActiveSubscription = true;
      user.currentSubscription = subscription._id;
      await user.save();
      
      // Send confirmation email
      await emailService.sendSubscriptionConfirmation(
        user.email,
        user.name,
        plan.name,
        plan.imagesLimit
      );
      
      console.log(`Subscription activated for user ${userId}, plan: ${planId}`);
    }
  } catch (error) {
    console.error('Webhook error:', error);
  }
};

// @desc    Get current user's subscription details
// @route   GET /api/payments/subscription
// @access  Private
exports.getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user subscription with populated plan details
    const subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      return res.status(200).json({
        success: true,
        hasSubscription: false,
        message: 'User does not have an active subscription'
      });
    }
    
    // Get plan details
    const plan = PLANS[subscription.plan];
    
    res.status(200).json({
      success: true,
      hasSubscription: subscription.active,
      data: {
        ...subscription.toObject(),
        planDetails: plan,
        imagesRemaining: plan.imagesLimit - subscription.imagesGenerated
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Check if user can generate more images
// @route   GET /api/payments/can-generate
// @access  Private
exports.canGenerateImage = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user subscription
    const subscription = await Subscription.findOne({ 
      user: userId,
      active: true 
    });
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        canGenerate: false,
        message: 'No active subscription found. Please purchase a plan to generate images.'
      });
    }
    
    // Check if user has used all image generations
    const imagesRemaining = subscription.imagesLimit - subscription.imagesGenerated;
    
    if (imagesRemaining <= 0) {
      return res.status(403).json({
        success: false,
        canGenerate: false,
        message: 'You have used all image generations in your current plan. Please upgrade to generate more images.'
      });
    }
    
    res.status(200).json({
      success: true,
      canGenerate: true,
      imagesRemaining
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check image generation capability',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Increment the image generation count for a user
// @route   POST /api/payments/increment-usage
// @access  Private (used internally by imageController)
exports.incrementImageUsage = async (userId) => {
  try {
    // Update subscription and return the updated document
    const subscription = await Subscription.findOneAndUpdate(
      { user: userId, active: true },
      { $inc: { imagesGenerated: 1 } },
      { new: true }
    );
    
    if (!subscription) {
      throw new Error('No active subscription found');
    }
    
    // Check if user has reached the limit
    if (subscription.imagesGenerated >= subscription.imagesLimit) {
      // Optional: Send email notification that user has used all allocations
      const user = await User.findById(userId);
      if (user) {
        await emailService.sendImageLimitReached(
          user.email,
          user.name,
          subscription.plan
        );
      }
    }
    
    return {
      success: true,
      imagesGenerated: subscription.imagesGenerated,
      imagesRemaining: subscription.imagesLimit - subscription.imagesGenerated
    };
  } catch (error) {
    console.error('Failed to increment image usage:', error);
    throw error;
  }
};

// @desc    Admin: Get all subscriptions (with pagination)
// @route   GET /api/payments/admin/subscriptions
// @access  Admin
exports.getAllSubscriptions = async (req, res) => {
  try {
    // Ensure user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    const subscriptions = await Subscription.find()
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ startDate: -1 });
    
    const total = await Subscription.countDocuments();
    
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Admin: Manually add or extend a subscription
// @route   POST /api/payments/admin/add-subscription
// @access  Admin
exports.addSubscription = async (req, res) => {
  try {
    // Ensure user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    const { userId, planId, additionalImages } = req.body;
    
    // Validate inputs
    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Plan ID are required'
      });
    }
    
    // Check if plan exists
    const plan = PLANS[planId];
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find existing subscription or create new one
    let subscription = await Subscription.findOne({ user: userId });
    
    if (subscription) {
      // Update existing subscription
      subscription.plan = planId;
      subscription.active = true;
      
      if (additionalImages) {
        // Add extra images to existing limit
        subscription.imagesLimit += parseInt(additionalImages, 10);
      } else {
        // Reset to plan default
        subscription.imagesLimit = plan.imagesLimit;
      }
      
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        user: userId,
        plan: planId,
        imagesLimit: additionalImages ? plan.imagesLimit + parseInt(additionalImages, 10) : plan.imagesLimit,
        imagesGenerated: 0,
        active: true,
        startDate: new Date(),
        paymentId: 'admin-added'
      });
      
      // Update user with subscription info
      user.hasActiveSubscription = true;
      user.currentSubscription = subscription._id;
      await user.save();
    }
    
    // Send confirmation email
    await emailService.sendSubscriptionConfirmation(
      user.email,
      user.name,
      plan.name,
      subscription.imagesLimit
    );
    
    res.status(200).json({
      success: true,
      message: 'Subscription added successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add subscription',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};