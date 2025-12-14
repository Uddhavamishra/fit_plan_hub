const express = require('express');
const Follow = require('../models/Follow');
const User = require('../models/User');
const FitnessPlan = require('../models/FitnessPlan');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/follows/:trainerId
// @desc    Follow a trainer
// @access  Private
router.post('/:trainerId', protect, async (req, res) => {
  try {
    // Can't follow yourself
    if (req.params.trainerId === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    // Check if trainer exists and is actually a trainer
    const trainer = await User.findOne({ 
      _id: req.params.trainerId, 
      role: 'trainer' 
    });

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      trainer: trainer._id
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'You are already following this trainer' });
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower: req.user._id,
      trainer: trainer._id
    });

    res.status(201).json({
      success: true,
      message: `You are now following ${trainer.name}`,
      data: follow
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You are already following this trainer' });
    }
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/follows/:trainerId
// @desc    Unfollow a trainer
// @access  Private
router.delete('/:trainerId', protect, async (req, res) => {
  try {
    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      trainer: req.params.trainerId
    });

    if (!follow) {
      return res.status(404).json({ message: 'You are not following this trainer' });
    }

    res.json({
      success: true,
      message: 'Unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/follows/following
// @desc    Get list of trainers current user is following
// @access  Private
router.get('/following', protect, async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.user._id })
      .populate('trainer', 'name email bio specialization')
      .sort({ followedAt: -1 });

    // Get plan count for each trainer
    const followingWithPlans = await Promise.all(
      following.map(async (f) => {
        const planCount = await FitnessPlan.countDocuments({ 
          trainer: f.trainer._id,
          isActive: true 
        });
        return {
          ...f.toObject(),
          trainer: {
            ...f.trainer.toObject(),
            planCount
          }
        };
      })
    );

    res.json({
      success: true,
      count: followingWithPlans.length,
      data: followingWithPlans
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/follows/check/:trainerId
// @desc    Check if current user follows a trainer
// @access  Private
router.get('/check/:trainerId', protect, async (req, res) => {
  try {
    const follow = await Follow.findOne({
      follower: req.user._id,
      trainer: req.params.trainerId
    });

    res.json({
      success: true,
      isFollowing: !!follow
    });
  } catch (error) {
    console.error('Check follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/follows/followers
// @desc    Get followers (for trainers)
// @access  Private
router.get('/followers', protect, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Only trainers can view their followers' });
    }

    const followers = await Follow.find({ trainer: req.user._id })
      .populate('follower', 'name email')
      .sort({ followedAt: -1 });

    res.json({
      success: true,
      count: followers.length,
      data: followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
