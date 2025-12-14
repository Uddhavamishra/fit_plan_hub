const express = require('express');
const User = require('../models/User');
const FitnessPlan = require('../models/FitnessPlan');
const Follow = require('../models/Follow');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/trainers
// @desc    Get all trainers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, specialization } = req.query;
    
    let query = { role: 'trainer' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    const trainers = await User.find(query)
      .select('name email bio specialization createdAt')
      .sort({ createdAt: -1 });

    // Get plan count and follower count for each trainer
    const trainersWithStats = await Promise.all(
      trainers.map(async (trainer) => {
        const planCount = await FitnessPlan.countDocuments({ 
          trainer: trainer._id,
          isActive: true 
        });
        const followerCount = await Follow.countDocuments({ trainer: trainer._id });
        
        return {
          ...trainer.toObject(),
          planCount,
          followerCount
        };
      })
    );

    res.json({
      success: true,
      count: trainersWithStats.length,
      data: trainersWithStats
    });
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/trainers/:id
// @desc    Get trainer profile with their plans
// @access  Public (with optional auth for follow status)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const trainer = await User.findOne({ 
      _id: req.params.id, 
      role: 'trainer' 
    }).select('name email bio specialization createdAt');

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Get trainer's plans
    const plans = await FitnessPlan.find({ 
      trainer: trainer._id,
      isActive: true 
    }).select('title description price duration category difficulty createdAt');

    // Get follower count
    const followerCount = await Follow.countDocuments({ trainer: trainer._id });

    // Check if current user follows this trainer
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({
        follower: req.user._id,
        trainer: trainer._id
      });
      isFollowing = !!follow;
    }

    res.json({
      success: true,
      data: {
        trainer: {
          ...trainer.toObject(),
          followerCount,
          planCount: plans.length,
          isFollowing
        },
        plans
      }
    });
  } catch (error) {
    console.error('Get trainer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
