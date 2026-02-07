const mongoose = require('mongoose');

// Comment sub-schema for ticket timeline
const commentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        text: {
            type: String,
            required: true,
        },
        translatedText: {
            type: String,
        },
        originalLanguage: {
            type: String, // e.g., 'es', 'en'
            default: 'en',
        },
        isInternal: {
            type: Boolean,
            default: false, // Internal notes visible only to agents/admin
        },
    },
    {
        timestamps: true,
    }
);

// Main Ticket schema
const ticketSchema = mongoose.Schema(
    {
        // Creator
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        // Assigned agent
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Basic info
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        // Multilingual Support
        originalLanguage: {
            type: String, // e.g., 'es', 'fr', 'hi'
            default: 'en',
        },
        originalTitle: {
            type: String,
        },
        originalDescription: {
            type: String,
        },
        translatedTitle: {
            type: String,
        },
        translatedDescription: {
            type: String,
        },
        // Status
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Open',
        },
        // User-provided category (optional)
        category: {
            type: String,
            enum: ['Bug', 'Payment Issue', 'Account Issue', 'Feature Request', 'General Query'],
            default: 'General Query',
        },
        // User-provided priority (optional)
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        // AI-generated fields
        aiCategory: {
            type: String,
            enum: ['Bug', 'Payment Issue', 'Account Issue', 'Feature Request', 'General Query', null],
            default: null,
        },
        aiPriority: {
            type: String,
            enum: ['Low', 'Medium', 'High', null],
            default: null,
        },
        aiSentiment: {
            type: String,
            enum: ['Angry', 'Frustrated', 'Neutral', 'Calm', 'Happy', null],
            default: null,
        },
        aiSummary: {
            type: String,
            default: null,
        },
        aiSuggestedReply: {
            type: String,
            default: null,
        },
        aiAnalyzedAt: {
            type: Date,
            default: null,
        },
        // Comments timeline
        comments: [commentSchema],
        // File attachments
        attachments: [
            {
                filename: String,
                url: String,
                mimetype: String,
                size: Number,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        // Resolution tracking
        resolvedAt: {
            type: Date,
            default: null,
        },
        closedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
