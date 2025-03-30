const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a payment session
 * @param {Object} options - Payment options
 * @returns {Promise<Object>} - Payment order details
 */
exports.createSession = async (options) => {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount * 100, // Amount in paisa (100 paisa = 1 INR)
      currency: options.currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: options.metadata.userId,
        planId: options.metadata.planId
      }
    });
    
    return {
      id: order.id,
      amount: order.amount / 100, // Convert back to INR for display
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      order_id: order.id,
      callback_url: `${process.env.SERVER_URL}/api/payments/webhook`,
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      notes: options.metadata
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Payment session creation failed');
  }
};

/**
 * Verify webhook signature
 * @param {Object} payload - Webhook payload
 * @param {String} signature - Razorpay signature
 * @returns {Promise<Object>} - Verified event object
 */
exports.verifyWebhookSignature = async (payload, signature) => {
  if (!signature) {
    throw new Error('No signature provided');
  }
  
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  // Create an HMAC hash with the webhook secret
  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(JSON.stringify(payload));
  const digest = shasum.digest('hex');
  
  // Compare the generated hash with the provided signature
  if (digest !== signature) {
    throw new Error('Invalid webhook signature');
  }
  
  // Format the event similar to how we'd use it in the controller
  const event = {
    type: payload.event,
    data: {
      ...payload.payload.payment.entity,
      metadata: payload.payload.payment.entity.notes
    }
  };
  
  return event;
};

/**
 * Verify payment
 * @param {String} orderId - Razorpay order ID
 * @param {String} paymentId - Razorpay payment ID
 * @param {String} signature - Razorpay signature
 * @returns {Boolean} - Whether payment is verified
 */
exports.verifyPayment = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  
  return generatedSignature === signature;
};