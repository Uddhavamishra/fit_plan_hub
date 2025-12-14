const express = require('express');
const FitnessPlan = require('../models/FitnessPlan');
const Subscription = require('../models/Subscription');
const Follow = require('../models/Follow');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/feed
// @desc    Get personalized feed for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get trainers the user follows
    const following = await Follow.find({ follower: req.user._id });
    const followedTrainerIds = following.map(f => f.trainer);

    // Get plans from followed trainers
    const feedPlans = await FitnessPlan.find({
      trainer: { $in: followedTrainerIds },
      isActive: true
    })
      .populate('trainer', 'name email bio specialization')
      .sort({ createdAt: -1 });

    // Get user's active subscriptions
    const subscriptions = await Subscription.find({
      user: req.user._id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    const subscribedPlanIds = subscriptions.map(s => s.plan.toString());

    // Build feed with subscription status
    const feed = feedPlans.map(plan => {
      const planObj = plan.toObject();
      const isSubscribed = subscribedPlanIds.includes(plan._id.toString());
      
      return {
        _id: planObj._id,
        title: planObj.title,
        description: isSubscribed ? planObj.description : planObj.description.substring(0, 150) + '...',
        price: planObj.price,
        duration: planObj.duration,
        category: planObj.category,
        difficulty: planObj.difficulty,
        trainer: planObj.trainer,
        createdAt: planObj.createdAt,
        isSubscribed,
        hasAccess: isSubscribed,
        workoutDetails: isSubscribed ? planObj.workoutDetails : null
      };
    });

    res.json({
      success: true,
      count: feed.length,
      followingCount: followedTrainerIds.length,
      subscribedCount: subscribedPlanIds.length,
      data: feed
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feed/purchased
// @desc    Get all purchased plans with full access
// @access  Private
router.get('/purchased', protect, async (req, res) => {
  try {
    // Get active subscriptions
    const subscriptions = await Subscription.find({
      user: req.user._id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    }).populate({
      path: 'plan',
      populate: {
        path: 'trainer',
        select: 'name email specialization'
      }
    });

    const purchasedPlans = subscriptions.map(sub => ({
      subscription: {
        _id: sub._id,
        purchaseDate: sub.purchaseDate,
        expiryDate: sub.expiryDate,
        amountPaid: sub.amountPaid
      },
      plan: sub.plan
    }));

    res.json({
      success: true,
      count: purchasedPlans.length,
      data: purchasedPlans
    });
  } catch (error) {
    console.error('Purchased plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
