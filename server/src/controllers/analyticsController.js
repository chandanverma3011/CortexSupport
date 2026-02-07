const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics/dashboard
 * @access  Private/Admin|Agent
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    // Get counts by status
    const statusCounts = await Ticket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get counts by AI category
    const categoryCounts = await Ticket.aggregate([
        { $match: { aiCategory: { $ne: null } } },
        { $group: { _id: '$aiCategory', count: { $sum: 1 } } },
    ]);

    // Get counts by AI priority
    const priorityCounts = await Ticket.aggregate([
        { $match: { aiPriority: { $ne: null } } },
        { $group: { _id: '$aiPriority', count: { $sum: 1 } } },
    ]);

    // Get total counts
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
    const closedTickets = await Ticket.countDocuments({ status: 'Closed' });

    // Get user and agent counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAgents = await User.countDocuments({ role: 'agent' });

    // Calculate average resolution time (for resolved/closed tickets)
    const resolutionTimeAgg = await Ticket.aggregate([
        { $match: { resolvedAt: { $ne: null } } },
        {
            $project: {
                resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] },
            },
        },
        {
            $group: {
                _id: null,
                avgTime: { $avg: '$resolutionTime' },
            },
        },
    ]);

    const avgResolutionMs = resolutionTimeAgg[0]?.avgTime || 0;
    const avgResolutionHours = Math.round(avgResolutionMs / (1000 * 60 * 60) * 10) / 10;

    // Bottlenecks: High priority unassigned tickets
    const highPriorityUnassigned = await Ticket.countDocuments({
        aiPriority: 'High',
        assignedTo: null,
        status: { $ne: 'Closed' }
    });

    // Bottlenecks: Oldest open tickets (top 5)
    const oldestOpenTickets = await Ticket.find({
        status: 'Open'
    })
        .sort({ createdAt: 1 })
        .limit(5)
        .populate('user', 'name');

    res.json({
        success: true,
        data: {
            totalTickets,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            closedTickets,
            totalUsers,
            totalAgents,
            highPriorityUnassigned,
            oldestOpenTickets,
            avgResolutionTime: `${avgResolutionHours}h`,
            byStatus: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            byCategory: categoryCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            byPriority: priorityCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
        },
    });
});

/**
 * @desc    Get monthly ticket trends
 * @route   GET /api/analytics/trends
 * @access  Private/Admin|Agent
 */
const getMonthlyTrends = asyncHandler(async (req, res) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Ticket.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                created: { $sum: 1 },
                resolved: {
                    $sum: {
                        $cond: [{ $ne: ['$resolvedAt', null] }, 1, 0],
                    },
                },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format for charts
    const formattedTrends = trends.map((t) => ({
        month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
        created: t.created,
        resolved: t.resolved,
    }));

    res.json({
        success: true,
        data: formattedTrends,
    });
});

/**
 * @desc    Get sentiment distribution
 * @route   GET /api/analytics/sentiment
 * @access  Private/Admin|Agent
 */
const getSentimentDistribution = asyncHandler(async (req, res) => {
    const sentimentCounts = await Ticket.aggregate([
        { $match: { aiSentiment: { $ne: null } } },
        { $group: { _id: '$aiSentiment', count: { $sum: 1 } } },
    ]);

    res.json({
        success: true,
        data: sentimentCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {}),
    });
});

/**
 * @desc    Get agent performance stats
 * @route   GET /api/analytics/agents
 * @access  Private/Admin
 */
const getAgentPerformance = asyncHandler(async (req, res) => {
    const agentStats = await Ticket.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        {
            $group: {
                _id: '$assignedTo',
                totalAssigned: { $sum: 1 },
                resolved: {
                    $sum: {
                        $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0],
                    },
                },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'agent',
            },
        },
        { $unwind: '$agent' },
        {
            $project: {
                agentId: '$_id',
                agentName: '$agent.name',
                agentEmail: '$agent.email',
                totalAssigned: 1,
                resolved: 1,
                resolutionRate: {
                    $multiply: [
                        { $divide: ['$resolved', '$totalAssigned'] },
                        100,
                    ],
                },
            },
        },
    ]);

    res.json({
        success: true,
        data: agentStats,
    });
});

/**
 * @desc    Get stats for specialized agent dashboard
 * @route   GET /api/analytics/agent
 * @access  Private/Agent|Admin
 */
const getAgentStats = asyncHandler(async (req, res) => {
    const agentId = new mongoose.Types.ObjectId(req.user._id);

    // Counts for this agent
    const statusCounts = await Ticket.aggregate([
        { $match: { assignedTo: agentId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const totalAssigned = await Ticket.countDocuments({ assignedTo: agentId });
    const resolvedCount = await Ticket.countDocuments({
        assignedTo: agentId,
        status: { $in: ['Resolved', 'Closed'] }
    });

    // High priority assigned but not closed
    const highPriorityActive = await Ticket.countDocuments({
        assignedTo: agentId,
        aiPriority: 'High',
        status: { $ne: 'Closed' }
    });

    // Avg resolution time for this agent
    const resolutionAgg = await Ticket.aggregate([
        { $match: { assignedTo: agentId, resolvedAt: { $ne: null } } },
        {
            $project: {
                resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] },
            },
        },
        { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } },
    ]);

    const avgResolutionMs = resolutionAgg[0]?.avgTime || 0;
    const avgResolutionHours = Math.round(avgResolutionMs / (1000 * 60 * 60) * 10) / 10;

    res.json({
        success: true,
        data: {
            totalAssigned,
            resolvedCount,
            highPriorityActive,
            avgResolutionHours,
            byStatus: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
        },
    });
});

/**
 * @desc    Get stats for specialized user dashboard
 * @route   GET /api/analytics/user
 * @access  Private/User
 */
const getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const totalTickets = await Ticket.countDocuments({ user: userId });
    const activeTickets = await Ticket.countDocuments({
        user: userId,
        status: { $in: ['Open', 'In Progress'] }
    });
    const resolvedTickets = await Ticket.countDocuments({
        user: userId,
        status: { $in: ['Resolved', 'Closed'] }
    });

    // Recent activity (last 3 tickets)
    const recentTickets = await Ticket.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .populate('assignedTo', 'name');

    res.json({
        success: true,
        data: {
            totalTickets,
            activeTickets,
            resolvedTickets,
            recentTickets
        },
    });
});

module.exports = {
    getDashboardStats,
    getMonthlyTrends,
    getSentimentDistribution,
    getAgentPerformance,
    getAgentStats,
    getUserStats,
};
