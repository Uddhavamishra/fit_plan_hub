const express = require('express');
const { body, validationResult } = require('express-validator');
const FitnessPlan = require('../models/FitnessPlan');
const Subscription = require('../models/Subscription');
const { protect, optionalAuth, trainerOnly } = require('../middleware/auth');

const router = express.Router();

// Validation rules for plan creation
const planValidation = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 day')
];


router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, difficulty, trainer, search } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (trainer) query.trainer = trainer;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const plans = await FitnessPlan.find(query)
      .populate('trainer', 'name email specialization')
      .sort({ createdAt: -1 });

    
    let userSubscriptions = [];
    if (req.user) {
      const subs = await Subscription.find({ 
        user: req.user._id, 
        isActive: true,
        expiryDate: { $gt: new Date() }
      });
      userSubscriptions = subs.map(s => s.plan.toString());
    }

    // Return preview or full details based on subscription
    const plansWithAccess = plans.map(plan => {
      const planObj = plan.toObject();
      const hasAccess = userSubscriptions.includes(plan._id.toString());
      
      return {
        _id: planObj._id,
        title: planObj.title,
        description: hasAccess ? planObj.description : planObj.description.substring(0, 150) + '...',
        price: planObj.price,
        duration: planObj.duration,
        category: planObj.category,
        difficulty: planObj.difficulty,
        trainer: planObj.trainer,
        createdAt: planObj.createdAt,
        hasAccess,
        workoutDetails: hasAccess ? planObj.workoutDetails : null
      };
    });

    res.json({
      success: true,
      count: plansWithAccess.length,
      data: plansWithAccess
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const plan = await FitnessPlan.findById(req.params.id)
      .populate('trainer', 'name email bio specialization');

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user has access
    let hasAccess = false;
    if (req.user) {
      // Trainers have access to their own plans
      if (req.user.role === 'trainer' && plan.trainer._id.toString() === req.user._id.toString()) {
        hasAccess = true;
      } else {
        // Check subscription
        const subscription = await Subscription.findOne({
          user: req.user._id,
          plan: plan._id,
          isActive: true,
          expiryDate: { $gt: new Date() }
        });
        hasAccess = !!subscription;
      }
    }

    const planObj = plan.toObject();
    
    // Return full or preview based on access
    const responseData = {
      _id: planObj._id,
      title: planObj.title,
      price: planObj.price,
      duration: planObj.duration,
      category: planObj.category,
      difficulty: planObj.difficulty,
      trainer: planObj.trainer,
      createdAt: planObj.createdAt,
      hasAccess
    };

    if (hasAccess) {
      responseData.description = planObj.description;
      responseData.workoutDetails = planObj.workoutDetails;
    } else {
      responseData.description = planObj.description.substring(0, 150) + '...';
      responseData.workoutDetails = null;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', protect, trainerOnly, planValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, duration, category, difficulty, workoutDetails } = req.body;

    const plan = await FitnessPlan.create({
      title,
      description,
      price,
      duration,
      category: category || 'general-fitness',
      difficulty: difficulty || 'beginner',
      workoutDetails: workoutDetails || '',
      trainer: req.user._id
    });

    await plan.populate('trainer', 'name email specialization');

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id', protect, trainerOnly, async (req, res) => {
  try {
    let plan = await FitnessPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check ownership
    if (plan.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this plan' });
    }

    const { title, description, price, duration, category, difficulty, workoutDetails, isActive } = req.body;

    // Update fields
    if (title) plan.title = title;
    if (description) plan.description = description;
    if (price !== undefined) plan.price = price;
    if (duration) plan.duration = duration;
    if (category) plan.category = category;
    if (difficulty) plan.difficulty = difficulty;
    if (workoutDetails !== undefined) plan.workoutDetails = workoutDetails;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();
    await plan.populate('trainer', 'name email specialization');

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, trainerOnly, async (req, res) => {
  try {
    const plan = await FitnessPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check ownership
    if (plan.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this plan' });
    }

    await FitnessPlan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/trainer/myplans', protect, trainerOnly, async (req, res) => {
  try {
    const plans = await FitnessPlan.find({ trainer: req.user._id })
      .populate('trainer', 'name email specialization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Get trainer plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
