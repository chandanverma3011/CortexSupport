const asyncHandler = require('express-async-handler');
const CSAT = require('../models/CSAT');
const Ticket = require('../models/Ticket');
const csatAnalyticsService = require('../services/csatAnalyticsService');

/**
 * @desc    Submit CSAT feedback
 * @route   POST /api/csat/:ticketId
 * @access  Private/User
 */
const createCSAT = asyncHandler(async (req, res) => {
    const { rating, feedback } = req.body;
    const { ticketId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
        res.status(400);
        throw new Error('Please provide a valid rating between 1 and 5');
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // SECURITY: Only ticket owner can submit CSAT
    if (ticket.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the ticket requester can submit satisfaction feedback');
    }

    // TRIGGER CONDITION: Ticket must be Resolved or Closed
    if (!['Resolved', 'Closed'].includes(ticket.status)) {
        res.status(400);
        throw new Error('CSAT feedback can only be submitted for Resolved or Closed tickets');
    }

    // PREVENT DUPLICATES: One CSAT allowed only ONCE per ticket
    const existingCSAT = await CSAT.findOne({ ticketId });
    if (existingCSAT) {
        res.status(400);
        throw new Error('Feedback has already been submitted for this ticket');
    }

    // Create CSAT entry
    const csat = await CSAT.create({
        ticketId,
        userId: req.user._id,
        agentId: ticket.assignedTo,
        rating,
        feedback,
        category: ticket.aiCategory || ticket.category,
    });

    res.status(201).json({
        success: true,
        data: csat,
    });
});

/**
 * @desc    Get CSAT for an agent (Read-only for Admins/Agents)
 * @route   GET /api/csat/agent/:agentId
 * @access  Private/Admin|Agent
 */
const getAgentCSAT = asyncHandler(async (req, res) => {
    const { agentId } = req.params;

    const feedback = await CSAT.find({ agentId })
        .sort({ createdAt: -1 })
        .populate('userId', 'name')
        .populate('ticketId', 'title');

    res.json({
        success: true,
        count: feedback.length,
        data: feedback,
    });
});

/**
 * @desc    Get CSAT Analytics (Admin only)
 * @route   GET /api/csat/analytics
 * @access  Private/Admin
 */
const getAnalytics = asyncHandler(async (req, res) => {
    const agentStats = await csatAnalyticsService.getAgentAnalytics();
    const categoryStats = await csatAnalyticsService.getCategoryAnalytics();
    const overview = await csatAnalyticsService.getPlatformOverview();

    res.json({
        success: true,
        data: {
            agents: agentStats,
            categories: categoryStats,
            overview,
        },
    });
});

/**
 * @desc    Check if CSAT exists for a ticket
 * @route   GET /api/csat/ticket/:ticketId
 * @access  Private
 */
const getTicketCSAT = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;
    const csat = await CSAT.findOne({ ticketId });

    res.json({
        success: true,
        exists: !!csat,
        data: csat,
    });
});

/**
 * @desc    Get latest CSAT feedback (Admin only)
 * @route   GET /api/csat/recent
 * @access  Private/Admin
 */
const getRecentCSAT = asyncHandler(async (req, res) => {
    const feedback = await CSAT.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .populate('agentId', 'name');

    res.json({
        success: true,
        data: feedback,
    });
});

module.exports = {
    createCSAT,
    getAgentCSAT,
    getAnalytics,
    getTicketCSAT,
    getRecentCSAT,
};
