const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getMonthlyTrends,
    getSentimentDistribution,
    getAgentPerformance,
    getAgentStats,
    getUserStats,
} = require('../controllers/analyticsController');
const { protect, adminOnly, adminOrAgent } = require('../middlewares/authMiddleware');

// Dashboard stats (Admin/Agent)
router.get('/dashboard', protect, adminOrAgent, getDashboardStats);

// Trends (Admin/Agent)
router.get('/trends', protect, adminOrAgent, getMonthlyTrends);

// Sentiment (Admin/Agent)
router.get('/sentiment', protect, adminOrAgent, getSentimentDistribution);

// Agent performance (Admin only)
router.get('/agents', protect, adminOnly, getAgentPerformance);

// Specialized Agent stats (Agent/Admin)
router.get('/agent', protect, adminOrAgent, getAgentStats);

// Specialized User stats (User)
router.get('/user', protect, getUserStats);

module.exports = router;
