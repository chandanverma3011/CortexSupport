const express = require('express');
const router = express.Router();
const {
    createCSAT,
    getAgentCSAT,
    getAnalytics,
    getTicketCSAT,
    getRecentCSAT,
} = require('../controllers/csatController');
const { protect, adminOnly, adminOrAgent } = require('../middlewares/authMiddleware');

// User route: Submit feedback
router.post('/:ticketId', protect, createCSAT);
router.get('/ticket/:ticketId', protect, getTicketCSAT);

// Agent/Admin route: View feedback for specific agent
router.get('/agent/:agentId', protect, adminOrAgent, getAgentCSAT);

// Admin route: View system-wide analytics & feedback
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/recent', protect, adminOnly, getRecentCSAT);

module.exports = router;
