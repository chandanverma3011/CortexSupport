const mongoose = require('mongoose');
require('dotenv').config();
const Ticket = require('./src/models/Ticket');
const User = require('./src/models/User');

const createDemoData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');

        // 1. Create Demo User
        const email = 'demo_multi@cortex.com';
        await User.deleteOne({ email }); // Clean up if exists

        const user = await User.create({
            name: 'Demo Multilingual User',
            email,
            password: 'password123',
            role: 'user'
        });
        console.log(`✅ Created User: ${email}`);

        // 2. Create Spanish Ticket
        await Ticket.create({
            user: user._id,
            title: 'I cannot access my account', // English title for Agent view
            description: 'Hello, I have forgotten my password and the recovery link does not work.', // English desc
            category: 'Account Issue',
            priority: 'High',
            status: 'Open',
            originalLanguage: 'es',
            originalTitle: 'No puedo acceder a mi cuenta',
            originalDescription: 'Hola, he olvidado mi contraseña y el enlace de recuperación no funciona.',
            translatedTitle: 'I cannot access my account',
            translatedDescription: 'Hello, I have forgotten my password and the recovery link does not work.'
        });
        console.log('✅ Created Spanish Ticket');

        // 3. Create French Ticket
        await Ticket.create({
            user: user._id,
            title: 'Billing problem',
            description: 'I see a double charge on my credit card this month.',
            category: 'Payment Issue',
            priority: 'High',
            status: 'Open',
            originalLanguage: 'fr',
            originalTitle: 'Problème de facturation',
            originalDescription: 'Je vois un double prélèvement sur ma carte bancaire ce mois-ci.',
            translatedTitle: 'Billing problem',
            translatedDescription: 'I see a double charge on my credit card this month.'
        });
        console.log('✅ Created French Ticket');

        console.log('\n🎉 Demo Data Ready!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createDemoData();
