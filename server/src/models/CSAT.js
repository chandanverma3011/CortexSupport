const mongoose = require('mongoose');

const csatSchema = mongoose.Schema(
    {
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Ticket',
            unique: true, // One CSAT per ticket
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        feedback: {
            type: String,
            trim: true,
            maxlength: [500, 'Feedback cannot exceed 500 characters'],
        },
        category: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for analytics performance
csatSchema.index({ agentId: 1, rating: 1 });
csatSchema.index({ category: 1, rating: 1 });
csatSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CSAT', csatSchema);
