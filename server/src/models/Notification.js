const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            enum: ['TICKET_ASSIGNED', 'TICKET_STATUS_CHANGED', 'NEW_COMMENT', 'TICKET_CREATED', 'TICKET_UNASSIGNED'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Notification', notificationSchema);
