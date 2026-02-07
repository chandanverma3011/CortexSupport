const { executeWithFailover } = require('./aiService');

/**
 * Detect language and translate text to English
 * @param {string} title 
 * @param {string} description 
 * @returns {Promise<{language: string, translatedTitle: string, translatedDescription: string}>}
 */
const detectAndTranslate = async (title, description) => {
    try {
        return await executeWithFailover(async (model) => {
            const prompt = `You are a professional translator for a customer support system.
            
            INPUT TITLE: "${title}"
            INPUT DESCRIPTION: "${description}"
            
            Task:
            1. Detect the language of the input.
            2. If it is NOT English, translate both Title and Description to English.
            3. If it IS English, return the original text.
            
            CRITICAL: Respond ONLY with a raw JSON object (no markdown).
            Structure:
            {
                "language": "ISO 2-letter code (e.g., en, es, fr, hi)",
                "translatedTitle": "Title in English",
                "translatedDescription": "Description in English"
            }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from potential markdown blocks
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('AI translation response not valid JSON');

            return JSON.parse(jsonMatch[0]);
        });
    } catch (error) {
        console.error('Translation Service Error:', error.message);
        // Fallback: assume English if translation fails
        return {
            language: 'en',
            translatedTitle: title,
            translatedDescription: description
        };
    }
};

/**
 * Translate a specific text to a target language
 * @param {string} text 
 * @param {string} targetLanguage // e.g., 'en', 'es'
 * @returns {Promise<string>}
 */
const translateText = async (text, targetLanguage) => {
    try {
        if (!text) return '';

        return await executeWithFailover(async (model) => {
            const prompt = `Translate the following text to ${targetLanguage === 'en' ? 'English' : targetLanguage}.
            
            TEXT: "${text}"
            
            Respond ONLY with the translated text. Do not add quotes or explanations.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        });
    } catch (error) {
        console.error('Translation Error:', error.message);
        return text; // Fallback to original
    }
};

module.exports = { detectAndTranslate, translateText };
