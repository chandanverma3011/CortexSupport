const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const Ticket = require('./server/src/models/Ticket');
const User = require('./server/src/models/User');

const checkTickets = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const tickets = await Ticket.find({ title: { $regex: /Old Bug/ } })
            .populate('assignedTo', 'name email');

        console.log('--- FOUND TICKETS ---');
        tickets.forEach(t => {
            console.log(`Title: ${t.title}`);
            console.log(`Status: ${t.status}`);
            console.log(`Assigned ID: ${t.assignedTo?._id || 'null'}`);
            console.log(`Assigned Name: ${t.assignedTo?.name || 'null'}`);
            console.log('------------------');
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTickets();
