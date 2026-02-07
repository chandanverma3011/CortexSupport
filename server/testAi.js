const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const testAI = async () => {
    const keys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3
    ].filter(Boolean);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        console.log(`\n--- Testing Key ${i + 1}: ${key.substring(0, 10)}... ---`);
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.log(`Key ${i + 1} Error: ${data.error.message}`);
                continue;
            }

            if (data.models) {
                console.log(`Key ${i + 1} is WORKING. Found ${data.models.length} models.`);
                const firstModel = data.models.find(m => m.supportedGenerationMethods.includes('generateContent'));
                if (firstModel) {
                    const modelName = firstModel.name.split('/').pop();
                    const genAI = new GoogleGenerativeAI(key);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent('Say Hi');
                    console.log(`Test content: ${(await result.response).text().trim()}`);
                }
            }
        } catch (e) {
            console.error(`Key ${i + 1} failed:`, e.message);
        }
    }
};

testAI();
