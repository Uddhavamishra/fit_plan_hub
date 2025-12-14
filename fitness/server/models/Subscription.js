const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FitnessPlan',
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'  // Simulated payment
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Compound index to prevent duplicate subscriptions
subscriptionSchema.index({ user: 1, plan: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
