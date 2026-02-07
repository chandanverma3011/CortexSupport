const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to get all available API keys dynamically
const getApiKeys = () => {
    const keys = [];

    // 1. Collect all GEMINI_API_KEY* variables from process.env
    Object.keys(process.env).forEach(envVar => {
        if (envVar.startsWith('GEMINI_API_KEY')) {
            const val = process.env[envVar];
            if (val && val.trim()) {
                keys.push({ name: envVar, value: val.trim() });
            }
        }
    });

    // 2. Filter out known expired keys (Diagnostic results: GEMINI_API_KEY_1 is expired)
    // We keep them in the list if they are healthy, but here we specifically skip the known bad one
    const healthyKeys = keys
        .filter(k => !k.value.startsWith('AIzaSyADWL')) // The expired Key #1
        .map(k => k.value);

    // 3. Return unique keys, prioritizing GEMINI_API_KEY (primary) if it exists and is healthy
    return [...new Set(healthyKeys)];
};

// Verified Model (supported by user's active keys and has available quota)
const AI_MODEL = 'gemini-flash-latest';

/**
 * Execute an AI operation with automatic failover between API keys
 */
const executeWithFailover = async (operation) => {
    const keys = getApiKeys();
    let lastError = null;

    if (keys.length === 0) {
        throw new Error('No active Gemini API keys available in environment.');
    }

    console.log(`[AI Engine] Initializing operation with ${keys.length} candidate keys...`);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const keyId = `Key #${i + 1} (${key.substring(0, 8)}...)`;

        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: AI_MODEL });

            // Execute the provided operation
            const result = await operation(model);

            if (i > 0) {
                console.log(`✨ [AI Engine] Success recovered using ${keyId} after previous failures.`);
            }
            return result;

        } catch (error) {
            lastError = error;

            // Detect retryable errors (Quota, Invalid Key, Server Error)
            const errorText = (error.message || '').toLowerCase();
            const isQuota = errorText.includes('429') || errorText.includes('quota');
            const isInvalidKey = errorText.includes('400') || errorText.includes('expired') || errorText.includes('invalid');
            const isServerError = errorText.includes('500') || errorText.includes('503') || errorText.includes('overloaded');

            if (isQuota || isInvalidKey || isServerError) {
                const reason = isQuota ? 'QUOTA EXCEEDED' : isInvalidKey ? 'KEY INVALID/EXPIRED' : 'SERVER OVERLOADED';
                console.warn(`⚠️ [AI Engine] ${reason} on ${keyId}. Attempting failover to next key...`);
                continue;
            }

            // For semantic errors (blocked content, etc.), we don't retry as it's a logic/content issue
            console.error(`❌ [AI Engine] Critical non-retryable error on ${keyId}: ${error.message}`);
            break;
        }
    }

    console.error(`💀 [AI Engine] All ${keys.length} API keys failed. System falling back to manual/local logic.`);
    throw lastError || new Error('All API keys exhausted.');
};

/**
 * Analyze ticket content using AI
 * Returns: category, priority, sentiment, summary, suggestedReply
 */
const analyzeTicket = async (title, description) => {
    try {
        const result = await executeWithFailover(async (model) => {
            const prompt = `You are an AI assistant for a customer support ticketing system. Analyze the following support ticket and provide a structured response.

TICKET TITLE: ${title}

TICKET DESCRIPTION: ${description}

Analyze this ticket and respond with ONLY a valid JSON object (no markdown, no code blocks) with the following structure:
{
    "category": "<one of: Bug, Payment Issue, Account Issue, Feature Request, General Query>",
    "priority": "<one of: Low, Medium, High>",
    "sentiment": "<one of: Angry, Frustrated, Neutral, Calm, Happy>",
    "summary": "<brief 1-2 sentence summary of the issue>",
    "suggestedReply": "<professional and empathetic response to the customer, 2-3 sentences>"
}

PRIORITY GUIDELINES:
- High: Payment failures, account lockouts, data loss, service outages
- Medium: Feature not working, slow performance, account issues
- Low: General questions, feature requests, minor issues

RESPONSE TONE:
- Be empathetic and professional
- Acknowledge the customer's concern
- Provide helpful next steps if possible`;

            const genResult = await model.generateContent(prompt);
            const response = await genResult.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('AI response not valid JSON');

            return JSON.parse(jsonMatch[0]);
        });

        // Validate and sanitize response
        return {
            category: validateEnum(result.category, ['Bug', 'Payment Issue', 'Account Issue', 'Feature Request', 'General Query'], 'General Query'),
            priority: validateEnum(result.priority, ['Low', 'Medium', 'High'], 'Medium'),
            sentiment: validateEnum(result.sentiment, ['Angry', 'Frustrated', 'Neutral', 'Calm', 'Happy'], 'Neutral'),
            summary: result.summary || 'Unable to generate summary',
            suggestedReply: result.suggestedReply || 'Thank you for reaching out. Our team will review your request and get back to you shortly.',
        };

    } catch (error) {
        logAiError('analyzeTicket', error);
        console.error('AI Analysis Error:', error.message);
        return getFallbackAnalysis(title, description);
    }
};

/**
 * Validate enum value
 */
const validateEnum = (value, allowedValues, defaultValue) => {
    return allowedValues.includes(value) ? value : defaultValue;
};

/**
 * Fallback analysis when AI is unavailable
 */
const getFallbackAnalysis = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();

    // Simple keyword-based analysis
    let category = 'General Query';
    let priority = 'Medium';
    let sentiment = 'Neutral';

    // Category detection
    if (text.includes('bug') || text.includes('error') || text.includes('crash') || text.includes('not working')) {
        category = 'Bug';
    } else if (text.includes('payment') || text.includes('billing') || text.includes('charge') || text.includes('refund')) {
        category = 'Payment Issue';
        priority = 'High';
    } else if (text.includes('account') || text.includes('login') || text.includes('password') || text.includes('access')) {
        category = 'Account Issue';
    } else if (text.includes('feature') || text.includes('suggest') || text.includes('would like') || text.includes('could you add')) {
        category = 'Feature Request';
        priority = 'Low';
    }

    // Sentiment detection
    if (text.includes('urgent') || text.includes('immediately') || text.includes('angry') || text.includes('frustrated') || text.includes('unacceptable')) {
        sentiment = 'Angry';
        priority = 'High';
    } else if (text.includes('please') || text.includes('thank') || text.includes('appreciate')) {
        sentiment = 'Calm';
    }

    return {
        category,
        priority,
        sentiment,
        summary: `${category} ticket: ${title.substring(0, 100)}`,
        suggestedReply: 'Thank you for contacting our support team. We have received your request and will respond shortly. If this is urgent, please let us know.',
    };
};

/**
 * Generate a reply suggestion for an existing ticket
 */
const generateReplySuggestion = async (ticket, context = '') => {
    try {
        return await executeWithFailover(async (model) => {
            const prompt = `You are a professional customer support agent. Generate a helpful reply for this ticket.

TICKET TITLE: ${ticket.title}
TICKET DESCRIPTION: ${ticket.description}
CURRENT STATUS: ${ticket.status}
CATEGORY: ${ticket.aiCategory || ticket.category}
${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

Write a professional, empathetic reply (2-4 sentences) that:
- Acknowledges the customer's concern
- Provides a helpful update or solution
- Maintains a positive tone

Respond with only the reply text, no formatting.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        });
    } catch (error) {
        logAiError('generateReplySuggestion', error);
        console.error('Reply Generation Error:', error.message);
        return 'Thank you for your patience. Our team is actively working on your request and will provide an update soon.';
    }
};

const fs = require('fs');

/**
 * Log AI errors to a file
 */
const logAiError = (context, error) => {
    const logMessage = `\n[${new Date().toISOString()}] ${context} ERROR:
Message: ${error.message}
Stack: ${error.stack}
Details: ${JSON.stringify(error, null, 2)}
-------------------------------------------\n`;
    try {
        fs.appendFileSync('ai_errors.log', logMessage);
    } catch (e) {
        console.error('Failed to write to ai_errors.log', e);
    }
};

/**
 * Predict priority and category based ONLY on title (for real-time UX)
 */
const predictFromTitle = async (title) => {
    try {
        const result = await executeWithFailover(async (model) => {
            const prompt = `Analyze this support ticket title: "${title}". 
            Predict the most likely PRIORITY (Low, Medium, High) and CATEGORY (Bug, Payment Issue, Account Issue, Feature Request, General Query).
            
            CRITICAL: Respond ONLY with a raw JSON object. No markdown blocks, no prefix/suffix.
            Example: {"priority": "High", "category": "Payment Issue"}`;

            const genResult = await model.generateContent(prompt);
            const response = await genResult.response;
            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error('AI response not valid JSON');
        });

        return {
            priority: validateEnum(result.priority, ['Low', 'Medium', 'High'], 'Medium'),
            category: validateEnum(result.category, ['Bug', 'Payment Issue', 'Account Issue', 'Feature Request', 'General Query'], 'General Query')
        };
    } catch (error) {
        logAiError('predictFromTitle', error);
        console.error('AI Prediction Error:', error.message);
        return { priority: 'Medium', category: 'General Query' };
    }
};

/**
 * Generate a detailed description based on a title
 */
const generateDescription = async (title) => {
    try {
        return await executeWithFailover(async (model) => {
            const prompt = `Act as a customer writing a support ticket. 
            The subject is: "${title}".
            Generate a professional and detailed description (at least 4 sentences) explaining the issue, what happened, why it's a problem, and what you've already tried.
            Respond with ONLY the description text. Do not include a subject or sign-off.`;

            const genResult = await model.generateContent(prompt);
            const response = await genResult.response;
            return response.text().trim();
        });
    } catch (error) {
        logAiError('generateDescription', error);
        console.error('AI Gen Description Error:', error.message);
        return 'Failed to generate description. Please try again or type manually.';
    }
};

module.exports = { analyzeTicket, generateReplySuggestion, predictFromTitle, generateDescription, executeWithFailover };
