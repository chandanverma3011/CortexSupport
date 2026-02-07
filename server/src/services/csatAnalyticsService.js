const CSAT = require('../models/CSAT');
const mongoose = require('mongoose');

/**
 * Service to handle CSAT analytics calculations
 */
const csatAnalyticsService = {
    /**
     * Get agent performance metrics
     */
    getAgentAnalytics: async () => {
        return await CSAT.aggregate([
            {
                $group: {
                    _id: '$agentId',
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 },
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'agentInfo'
                }
            },
            { $unwind: '$agentInfo' },
            {
                $project: {
                    name: '$agentInfo.name',
                    email: '$agentInfo.email',
                    averageRating: { $round: ['$averageRating', 2] },
                    totalRatings: 1
                }
            },
            { $sort: { averageRating: -1, totalRatings: -1 } }
        ]);
    },

    /**
     * Get satisfaction metrics by category
     */
    getCategoryAnalytics: async () => {
        return await CSAT.aggregate([
            {
                $group: {
                    _id: '$category',
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: '$_id',
                    averageRating: { $round: ['$averageRating', 2] },
                    totalRatings: 1,
                    _id: 0
                }
            },
            { $sort: { averageRating: 1 } } // Show problem areas first
        ]);
    },

    /**
     * Get overall platform satisfaction and trends
     */
    getPlatformOverview: async () => {
        const stats = await CSAT.aggregate([
            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: null,
                                averageRating: { $avg: '$rating' },
                                totalRatings: { $sum: 1 }
                            }
                        }
                    ],
                    monthlyTrends: [
                        {
                            $group: {
                                _id: {
                                    month: { $month: '$createdAt' },
                                    year: { $year: '$createdAt' }
                                },
                                averageRating: { $avg: '$rating' },
                                totalRatings: { $sum: 1 }
                            }
                        },
                        { $sort: { '_id.year': 1, '_id.month': 1 } },
                        { $limit: 12 }
                    ]
                }
            }
        ]);

        return {
            overall: stats[0].overall[0] || { averageRating: 0, totalRatings: 0 },
            monthlyTrends: stats[0].monthlyTrends
        };
    }
};

module.exports = csatAnalyticsService;
