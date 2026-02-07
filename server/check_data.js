const mongoose = require('mongoose');
require('dotenv').config();
const Ticket = require('./src/models/Ticket');
const User = require('./src/models/User');

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');

        const users = await User.find({});
        console.log(`\n👥 Users Found: ${users.length}`);
        users.forEach(u => console.log(`   - ${u.name} (${u.email}) [${u.role}]`));

        const tickets = await Ticket.find({}).populate('user', 'email');
        console.log(`\n🎫 Tickets Found: ${tickets.length}`);

        console.log('\n--- Recent Tickets ---');
        tickets.slice(-5).forEach(t => {
            console.log(`   - [${t.status}] ${t.title}`);
            console.log(`     Owner: ${t.user ? t.user.email : 'UNKNOWN'}`);
            console.log(`     Lang: ${t.originalLanguage || 'en'}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
