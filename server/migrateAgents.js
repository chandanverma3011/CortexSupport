require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

/**
 * Migration: Ensures all agents have expertise and isActive fields
 */
const migrateAgents = async () => {
    try {
        await connectDB();
        console.log('--- STARTING AGENT MIGRATION ---');

        const result = await User.updateMany(
            { role: 'agent', expertise: { $exists: false } },
            { $set: { expertise: ['general'], isActive: true } }
        );

        console.log(`✅ MIGRATION COMPLETE: Updated ${result.modifiedCount} legacy agents.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateAgents();
