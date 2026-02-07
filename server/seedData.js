const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Ticket = require('./src/models/Ticket');
const connectDB = require('./src/config/db');

// Dummy Data Arrays
const AGENTS = [
    { name: 'Agent Smith', email: 'agent1@cortex.com', password: 'password123', role: 'agent' },
    { name: 'Sarah Jones', email: 'agent2@cortex.com', password: 'password123', role: 'agent' },
];

const USERS = [
    { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' },
    { name: 'Alice Wonderland', email: 'alice@example.com', password: 'password123', role: 'user' },
    { name: 'Bob Builder', email: 'bob@example.com', password: 'password123', role: 'user' },
];

const TICKET_TEMPLATES = [
    { title: 'Login issues on mobile', description: 'I cannot login on my iPhone. It says "Network Error".', category: 'Bug', priority: 'High', status: 'Open' },
    { title: 'Billing update', description: 'I need to update my credit card information.', category: 'Payment Issue', priority: 'High', status: 'Open' },
    { title: 'Feature request: Dark mode', description: 'Please add dark mode to the dashboard.', category: 'Feature Request', priority: 'Low', status: 'In Progress' },
    { title: 'Cannot find settings', description: 'Where can I change my email address?', category: 'General Query', priority: 'Low', status: 'Resolved' },
    { title: 'App crashes when uploading photo', description: 'Every time I try to attach a photo, the app closes.', category: 'Bug', priority: 'High', status: 'Open' },
    { title: 'Refund request', description: 'I was double charged for my subscription.', category: 'Payment Issue', priority: 'High', status: 'In Progress' },
    { title: 'Account locked', description: 'I entered my password wrong too many times.', category: 'Account Issue', priority: 'Medium', status: 'Open' },

    // [MULTILINGUAL] Examples
    {
        title: 'No puedo acceder a mi cuenta',
        description: 'Hola, he olvidado mi contraseña y el enlace de recuperación no funciona.',
        category: 'Account Issue',
        priority: 'High',
        status: 'Open',
        originalLanguage: 'es',
        translatedTitle: 'Cannot access my account',
        translatedDescription: 'Hello, I have forgotten my password and the recovery link does not work.'
    },
    {
        title: 'Problème de facturation',
        description: 'Je vois un double prélèvement sur ma carte bancaire ce mois-ci.',
        category: 'Payment Issue',
        priority: 'High',
        status: 'Open',
        originalLanguage: 'fr',
        translatedTitle: 'Billing problem',
        translatedDescription: 'I see a double charge on my credit card this month.'
    },
    {
        title: 'Fehler beim Laden der Seite',
        description: 'Die Dashboard-Seite lädt sehr langsam und zeigt manchmal einen 500-Fehler.',
        category: 'Bug',
        priority: 'Medium',
        status: 'Open',
        originalLanguage: 'de',
        translatedTitle: 'Error loading page',
        translatedDescription: 'The dashboard page loads very slowly and sometimes shows a 500 error.'
    },
];

const seedData = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Clear existing data (except Admin)
        await Ticket.deleteMany({});
        console.log('🗑️  Cleared Tickets');

        // Only delete non-admin users to preserve the admin account
        await User.deleteMany({ role: { $ne: 'admin' } });
        console.log('🗑️  Cleared non-admin Users');

        // Create Agents
        const createdAgents = [];
        for (const agent of AGENTS) {
            console.log(`⏳ Creating agent: ${agent.email}`);
            const user = await User.create(agent);
            createdAgents.push(user);
            console.log(`✅ Created agent: ${agent.name}`);
        }
        console.log(`✅ Total Agents Created: ${createdAgents.length}`);

        // Create Users
        const createdUsers = [];
        for (const user of USERS) {
            const newUser = await User.create(user);
            createdUsers.push(newUser);
        }
        console.log(`✅ Created ${createdUsers.length} Users`);

        // Create Tickets
        const tickets = [];
        for (let i = 0; i < 20; i++) {
            const template = TICKET_TEMPLATES[Math.floor(Math.random() * TICKET_TEMPLATES.length)];
            const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];

            // Ensure In Progress or Resolved tickets have an agent
            let assignedTo = null;
            if (template.status !== 'Open') {
                assignedTo = createdAgents[Math.floor(Math.random() * createdAgents.length)]._id;
            } else if (Math.random() > 0.5) {
                // Some open tickets can also be assigned
                assignedTo = createdAgents[Math.floor(Math.random() * createdAgents.length)]._id;
            }

            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

            let resolvedAt = null;
            if (template.status === 'Resolved' || template.status === 'Closed') {
                resolvedAt = new Date(createdAt);
                resolvedAt.setHours(resolvedAt.getHours() + Math.floor(Math.random() * 48) + 1);
            }

            tickets.push({
                ...template,
                title: `${template.title} #${i + 1}`,
                user: user._id,
                assignedTo: assignedTo,
                createdAt: createdAt,
                updatedAt: resolvedAt || createdAt,
                resolvedAt: resolvedAt,
                // Simulate AI analysis data
                aiCategory: template.category,
                aiPriority: template.priority,
                aiSentiment: ['Neutral', 'Frustrated', 'Calm'][Math.floor(Math.random() * 3)],
                aiSummary: `AI summary for ${template.title}`,
                aiSuggestedReply: `Suggested reply for ${template.title}...`,
                aiAnalyzedAt: createdAt,

                // [MULTILINGUAL] Map explicit fields if present
                originalLanguage: template.originalLanguage || 'en',
                originalTitle: template.originalLanguage ? template.title : undefined,
                originalDescription: template.originalLanguage ? template.description : undefined,
                translatedTitle: template.translatedTitle,
                translatedDescription: template.translatedDescription,
                // If translated, swap main title/desc to English for Agent view (simulating the Controller logic)
                title: template.translatedTitle || template.title,
                description: template.translatedDescription || template.description,
            });
        }

        await Ticket.insertMany(tickets);
        console.log(`✅ Created ${tickets.length} Tickets`);

        console.log('🎉 Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
