const asyncHandler = require('express-async-handler');
const aiService = require('../services/aiService');

// @desc    Analyze ticket content
// @route   POST /api/ai/analyze
// @access  Private
const analyzeContent = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text) {
        res.status(400);
        throw new Error('No text provided');
    }

    const analysis = await aiService.analyzeTicket(text);
    res.json(analysis);
});

module.exports = { analyzeContent };
