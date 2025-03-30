const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  planId: {
    type: String,
    required: [true, 'Please provide a plan ID'],
    enum: ['basic', 'premium']
  },
  planName: {
    type: String,
    required: [true, 'Please provide a plan name']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  imagesLimit: {
    type: Number,
    required: [true, 'Please provide images limit']
  },
  imagesRemaining: {
    type: Number,
    required: [true, 'Please provide images remaining']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  paymentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);