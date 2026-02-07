const express = require('express');
const router = express.Router();
const {
    createTicket,
    getMyTickets,
    getTicket,
    getAllTickets,
    getAssignedTickets,
    assignTicket,
    updateTicketStatus,
    addComment,
    getSuggestedReply,
    predictTicketDetails,
    generateTicketDescription,
    deleteTicket,
} = require('../controllers/ticketController');
const { protect, adminOnly, agentOnly, adminOrAgent } = require('../middlewares/authMiddleware');

const upload = require('../middlewares/uploadMiddleware');

// ===========================================
// User Routes
// ===========================================
router.post('/', protect, upload.array('attachments', 5), createTicket);
router.get('/my', protect, getMyTickets);
router.post('/predict', protect, predictTicketDetails);
router.post('/generate-description', protect, generateTicketDescription);

// ===========================================
// Admin/Agent Routes
// ===========================================
router.get('/all', protect, adminOrAgent, getAllTickets);
router.get('/assigned', protect, agentOnly, getAssignedTickets);

// ===========================================
// Ticket-specific Routes
// ===========================================
router.get('/:id', protect, getTicket);
router.put('/:id/assign', protect, adminOnly, assignTicket);
router.put('/:id/status', protect, adminOrAgent, updateTicketStatus);
router.post('/:id/comments', protect, upload.array('attachments', 5), addComment);
router.get('/:id/suggest-reply', protect, adminOrAgent, getSuggestedReply);
router.delete('/:id', protect, adminOnly, deleteTicket);

module.exports = router;
