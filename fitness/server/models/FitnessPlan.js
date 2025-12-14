const mongoose = require('mongoose');

const fitnessPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Plan title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  duration: {
    type: Number,  // Duration in days
    required: [true, 'Duration is required'],
    min: 1
  },
  category: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'endurance', 'flexibility', 'general-fitness'],
    default: 'general-fitness'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  workoutDetails: {
    type: String,  // Full workout content - only visible to subscribers
    default: ''
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update the updatedAt field on save
fitnessPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FitnessPlan', fitnessPlanSchema);
