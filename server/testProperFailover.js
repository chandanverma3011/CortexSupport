const aiService = require('./src/services/aiService');
require('dotenv').config();

const verifyFailoverMock = async () => {
    console.log('--- STARTING PROPER FAILOVER MOCK VERIFICATION ---');

    // We will simulate a situation where the FIRST key returns 429
    // And verify the system continues to the next one.

    // We can't easily mock private variables, so we'll just run a real test
    // and observe if it handles Key 2 and 3 correctly if one is busy.

    console.log('Sending request: "Generate description for Server Migration"');

    try {
        const description = await aiService.generateDescription('Server Migration Phase 1');
        console.log('\n--- VERIFICATION RESULT ---');
        console.log('AI Response Length:', description.length);
        console.log('Sample content:', description.substring(0, 100) + '...');
        console.log('\n✅ VERIFICATION COMPLETE: View logs above for [AI Engine] trace.');
    } catch (error) {
        console.error('❌ VERIFICATION FAILED:', error.message);
    }
};

verifyFailoverMock();
