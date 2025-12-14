require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const subscriptionRoutes = require('./routes/subscriptions');
const followRoutes = require('./routes/follows');
const feedRoutes = require('./routes/feed');
const trainerRoutes = require('./routes/trainers');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🏋️ Welcome to FitPlanHub API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      plans: '/api/plans',
      subscriptions: '/api/subscriptions',
      follows: '/api/follows',
      feed: '/api/feed',
      trainers: '/api/trainers'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/trainers', trainerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 FitPlanHub Server Running!
  ============================
  Port: ${PORT}
  Mode: ${process.env.NODE_ENV || 'development'}
  API:  http://localhost:${PORT}
  ============================
  `);
});
