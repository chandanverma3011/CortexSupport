const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { analyzeTicket, generateReplySuggestion, predictFromTitle, generateDescription } = require('../services/aiService');
const { detectAndTranslate, translateText } = require('../services/translationService');
const agentAssignmentService = require('../services/agentAssignmentService');

// ===========================================
// USER ENDPOINTS
// ===========================================

/**
 * @desc    Create new ticket (with AI analysis)
 * @route   POST /api/tickets
 * @access  Private/User
 */
const createTicket = asyncHandler(async (req, res) => {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
        res.status(400);
        throw new Error('Please provide title and description');
    }

    // Extract attachments from req.files if they exist
    const attachments = req.files ? req.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
    })) : [];

    // [MULTILINGUAL] Detect language and translate to English
    // This allows the AI to analyze the English version regardless of input language
    const translation = await detectAndTranslate(title, description);

    // Prepare ticket data
    // If language is not English, we store original text and use English for main fields
    // If language IS English, 'translation' returns the original text as 'translated*'
    const ticketData = {
        user: req.user._id,
        title: translation.translatedTitle, // Always English (or original if en)
        description: translation.translatedDescription, // Always English
        category: category || 'General Query',
        priority: priority || 'Medium',
        status: 'Open',
        attachments,

        // Internal Multilingual Fields
        originalLanguage: translation.language,
        originalTitle: title,
        originalDescription: description,
        translatedTitle: translation.translatedTitle,
        translatedDescription: translation.translatedDescription
    };

    // Create ticket first
    const ticket = await Ticket.create(ticketData);

    // Run AI analysis asynchronously
    try {
        const aiResult = await analyzeTicket(title, description);
        ticket.aiCategory = aiResult.category;
        ticket.aiPriority = aiResult.priority;
        ticket.aiSentiment = aiResult.sentiment;
        ticket.aiSummary = aiResult.summary;
        ticket.aiSuggestedReply = aiResult.suggestedReply;
        ticket.aiAnalyzedAt = new Date();

        // AUTO-ASSIGN: Route to the best agent based on AI analysis
        await agentAssignmentService.autoAssignTicket(ticket);

        await ticket.save();
    } catch (error) {
        console.error('AI analysis/assignment failed:', error.message);
        // Ticket is still created, just without AI analysis or auto-assignment
    }

    // Notify User
    await Notification.create({
        user: req.user._id,
        type: 'TICKET_CREATED',
        message: `Your ticket "${title}" has been created successfully.`,
        ticket: ticket._id,
    });

    res.status(201).json({
        success: true,
        data: ticket,
    });
});

/**
 * @desc    Get user's own tickets
 * @route   GET /api/tickets/my
 * @access  Private/User
 */
const getMyTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('assignedTo', 'name email');

    res.json({
        success: true,
        count: tickets.length,
        data: tickets,
    });
});

/**
 * @desc    Get single ticket (user can only see own tickets)
 * @route   GET /api/tickets/:id
 * @access  Private
 */
const getTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id)
        .populate('user', 'name email')
        .populate('assignedTo', 'name email')
        .populate('comments.user', 'name email role');

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Check access: user can see own tickets, admin/agent can see all
    const isOwner = ticket.user._id.toString() === req.user._id.toString();
    const isAdminOrAgent = ['admin', 'agent'].includes(req.user.role);
    const isAssigned = ticket.assignedTo && ticket.assignedTo._id.toString() === req.user._id.toString();

    if (!isOwner && !isAdminOrAgent && !isAssigned) {
        res.status(403);
        throw new Error('Not authorized to view this ticket');
    }

    // Filter internal comments for regular users
    if (req.user.role === 'user') {
        ticket.comments = ticket.comments.filter(c => !c.isInternal);
    }

    res.json({
        success: true,
        data: ticket,
    });
});

// ===========================================
// ADMIN/AGENT ENDPOINTS
// ===========================================

/**
 * @desc    Get all tickets (Admin/Agent)
 * @route   GET /api/tickets/all
 * @access  Private/Admin|Agent
 */
const getAllTickets = asyncHandler(async (req, res) => {
    const { status, category, priority, assignedTo } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (category) query.aiCategory = category;
    if (priority) query.aiPriority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tickets = await Ticket.find(query)
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
        .populate('assignedTo', 'name email');

    res.json({
        success: true,
        count: tickets.length,
        data: tickets,
    });
});

/**
 * @desc    Get agent's assigned tickets
 * @route   GET /api/tickets/assigned
 * @access  Private/Agent
 */
const getAssignedTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find({ assignedTo: req.user._id })
        .sort({ createdAt: -1 })
        .populate('user', 'name email');

    res.json({
        success: true,
        count: tickets.length,
        data: tickets,
    });
});

/**
 * @desc    Assign ticket to agent (Admin only)
 * @route   PUT /api/tickets/:id/assign
 * @access  Private/Admin
 */
const assignTicket = asyncHandler(async (req, res) => {
    // SECURITY: Only Admin can manually reassign tickets
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only administrators can manually assign tickets');
    }

    const { agentId } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Verify agent exists and has agent role
    if (agentId) {
        const agent = await User.findById(agentId);
        if (!agent || agent.role !== 'agent') {
            res.status(400);
            throw new Error('Invalid agent');
        }
    }

    // AUDIT: Log manual reassignment
    const oldAssignee = ticket.assignedTo;
    ticket.assignedTo = agentId || null;

    if (agentId && ticket.status === 'Open') {
        ticket.status = 'In Progress';
    }

    await ticket.save();

    console.log(`[Audit Log] Ticket "${ticket.title}" manual assignment changed from [${oldAssignee}] to [${agentId}] by Admin [${req.user._id}]`);
    await ticket.populate('assignedTo', 'name email');

    // Notify Agent
    if (agentId) {
        await Notification.create({
            user: agentId,
            type: 'TICKET_ASSIGNED',
            message: `You have been assigned ticket "${ticket.title}"`,
            ticket: ticket._id,
        });

        // Notify User
        await Notification.create({
            user: ticket.user,
            type: 'TICKET_ASSIGNED',
            message: `Your ticket "${ticket.title}" has been assigned to ${ticket.assignedTo.name}`,
            ticket: ticket._id,
        });
    }

    res.json({
        success: true,
        data: ticket,
    });
});

/**
 * @desc    Update ticket status
 * @route   PUT /api/tickets/:id/status
 * @access  Private/Admin|Agent
 */
const updateTicketStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Track resolution time
    if (status === 'Resolved' && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
    }
    if (status === 'Closed' && !ticket.closedAt) {
        ticket.closedAt = new Date();
    }

    ticket.status = status;
    await ticket.save();
    await ticket.populate('user', 'name email');
    await ticket.populate('assignedTo', 'name email');

    // Notify User
    await Notification.create({
        user: ticket.user._id,
        type: 'TICKET_STATUS_CHANGED',
        message: `Your ticket "${ticket.title}" status is now ${status}`,
        ticket: ticket._id,
    });

    res.json({
        success: true,
        data: ticket,
    });
});

/**
 * @desc    Add comment to ticket
 * @route   POST /api/tickets/:id/comments
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
    const { text, isInternal } = req.body;

    if (!text) {
        res.status(400);
        throw new Error('Comment text is required');
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Only admin/agent can add internal notes
    const internal = isInternal && ['admin', 'agent'].includes(req.user.role);

    // Extract attachments from req.files if they exist
    const attachments = req.files ? req.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
    })) : [];

    // [MULTILINGUAL]
    // 1. If User comments: Translate to English (for Agent)
    // 2. If Agent comments: Translate to Ticket's original language (for User)
    let targetLanguage = 'en';
    if (['admin', 'agent'].includes(req.user.role)) {
        targetLanguage = ticket.originalLanguage || 'en';
    }

    // Only translate if target language is different from source (assumed) or if we want to ensure English availability
    // simpler strategy: Always translate contextually
    const translatedText = await translateText(text, targetLanguage);

    ticket.comments.push({
        user: req.user._id,
        text,
        translatedText,
        originalLanguage: req.user.role === 'user' ? (ticket.originalLanguage || 'en') : 'en', // Assumption: Agents write in English
        isInternal: internal,
        attachments,
    });

    await ticket.save();
    await ticket.populate('comments.user', 'name email role');

    // Notify Recipient
    // If User commented -> Notify Agent (if assigned)
    // If Agent commented -> Notify User
    if (req.user.role === 'user' && ticket.assignedTo) {
        await Notification.create({
            user: ticket.assignedTo,
            type: 'NEW_COMMENT',
            message: `New reply from ${req.user.name} on ticket "${ticket.title}"`,
            ticket: ticket._id,
        });
    } else if (['agent', 'admin'].includes(req.user.role) && !internal) {
        // Don't notify user for internal notes
        await Notification.create({
            user: ticket.user,
            type: 'NEW_COMMENT',
            message: `New reply from support on ticket "${ticket.title}"`,
            ticket: ticket._id,
        });
    }

    res.json({
        success: true,
        data: ticket.comments[ticket.comments.length - 1],
    });
});

/**
 * @desc    Get AI-suggested reply for a ticket
 * @route   GET /api/tickets/:id/suggest-reply
 * @access  Private/Admin|Agent
 */
const getSuggestedReply = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    const { context } = req.query;
    const suggestion = await generateReplySuggestion(ticket, context);

    res.json({
        success: true,
        data: {
            suggestedReply: suggestion,
        },
    });
});

/**
 * @desc    Delete ticket
 * @route   DELETE /api/tickets/:id
 * @access  Private/Admin
 */
const deleteTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    await ticket.deleteOne();

    res.json({
        success: true,
        message: 'Ticket deleted',
    });
});

/**
 * @desc    Predict ticket priority and category from title
 * @route   POST /api/tickets/predict
 * @access  Private
 */
const predictTicketDetails = asyncHandler(async (req, res) => {
    const { title } = req.body;
    if (!title) {
        res.status(400);
        throw new Error('Title is required');
    }

    const prediction = await predictFromTitle(title);
    res.json({
        success: true,
        data: prediction
    });
});

/**
 * @desc    Generate ticket description from title
 * @route   POST /api/tickets/generate-description
 * @access  Private
 */
const generateTicketDescription = asyncHandler(async (req, res) => {
    const { title } = req.body;
    if (!title) {
        res.status(400);
        throw new Error('Title is required');
    }

    const description = await generateDescription(title);
    res.json({
        success: true,
        data: { description }
    });
});

module.exports = {
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
};
