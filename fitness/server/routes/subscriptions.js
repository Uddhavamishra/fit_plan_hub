const express = require('express');
const Subscription = require('../models/Subscription');
const FitnessPlan = require('../models/FitnessPlan');
const { protect, userOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/:planId', protect, userOnly, async (req, res) => {
  try {
    const plan = await FitnessPlan.findById(req.params.planId);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (!plan.isActive) {
      return res.status(400).json({ message: 'This plan is no longer available' });
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      plan: plan._id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'You already have an active subscription to this plan' });
    }

    // Calculate expiry date based on plan duration
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    // Create subscription (simulated payment - always succeeds)
    const subscription = await Subscription.create({
      user: req.user._id,
      plan: plan._id,
      expiryDate,
      amountPaid: plan.price,
      paymentStatus: 'completed'
    });

    await subscription.populate('plan');

    res.status(201).json({
      success: true,
      message: 'Payment successful! You now have access to this plan.',
      data: subscription
    });
  } catch (error) {
    // Handle duplicate subscription error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already have a subscription to this plan' });
    }
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate({
        path: 'plan',
        populate: {
          path: 'trainer',
          select: 'name email specialization'
        }
      })
      .sort({ purchaseDate: -1 });

    // Separate active and expired
    const now = new Date();
    const activeSubscriptions = subscriptions.filter(s => s.isActive && s.expiryDate > now);
    const expiredSubscriptions = subscriptions.filter(s => !s.isActive || s.expiryDate <= now);

    res.json({
      success: true,
      data: {
        active: activeSubscriptions,
        expired: expiredSubscriptions,
        total: subscriptions.length
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/check/:planId', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      plan: req.params.planId,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    res.json({
      success: true,
      isSubscribed: !!subscription,
      subscription: subscription || null
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:subscriptionId', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.subscriptionId,
      user: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.isActive = false;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
