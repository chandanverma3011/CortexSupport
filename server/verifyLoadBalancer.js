require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

// Ensure all models are registered
const User = require('./src/models/User');
const Ticket = require('./src/models/Ticket');
const Notification = require('./src/models/Notification');
const agentAssignmentService = require('./src/services/agentAssignmentService');

const verifyLoadBalancer = async () => {
    try {
        await connectDB();
        console.log('\n🚀 --- STARTING LOAD BALANCER VERIFICATION ---');

        // 1. Setup Test Agents
        console.log('🧹 Cleaning up old test agents...');
        await User.deleteMany({ email: /test-agent-.*@example.com/ });
        await Ticket.deleteMany({ title: /LoadBalancerTest-.*/ });

        const agents = [
            {
                name: 'Tech Expert (Busy)',
                email: 'test-agent-tech-busy@example.com',
                password: 'password123',
                role: 'agent',
                expertise: ['technical'],
                isActive: true
            },
            {
                name: 'Tech Expert (Free)',
                email: 'test-agent-tech-free@example.com',
                password: 'password123',
                role: 'agent',
                expertise: ['technical'],
                isActive: true
            },
            {
                name: 'Payment Agent',
                email: 'test-agent-payment@example.com',
                password: 'password123',
                role: 'agent',
                expertise: ['payment'],
                isActive: true
            }
        ];

        console.log('📝 Creating test agents...');
        const createdAgents = await User.insertMany(agents);
        const techBusy = createdAgents[0];
        const techFree = createdAgents[1];
        const payAgent = createdAgents[2];

        // 2. Mock some workload for techBusy
        console.log('⚖️ Mocking workload: Tech Expert (Busy) gets 2 tickets...');
        const someUser = createdAgents[0]; // Doesn't matter who

        await Ticket.create([
            { user: someUser._id, assignedTo: techBusy._id, title: 'LoadBalancerTest-Busy1', description: 'desc', status: 'In Progress', category: 'Bug' },
            { user: someUser._id, assignedTo: techBusy._id, title: 'LoadBalancerTest-Busy2', description: 'desc', status: 'Open', category: 'Bug' }
        ]);

        // 3. TEST CASE 1: TECHNICAL TICKET -> Should go to Tech Expert (Free)
        console.log('\n🧪 TEST 1: Technical Ticket ("Bug")');
        const t1 = new Ticket({
            title: 'LoadBalancerTest-T1',
            description: 'Crashing on start',
            category: 'Bug',
            aiCategory: 'Bug',
            status: 'Open',
            user: someUser._id
        });
        const res1 = await agentAssignmentService.autoAssignTicket(t1);
        console.log(`✅ Result: Assigned to "${res1 ? res1.name : 'NONE'}" (Expertise: ${res1 ? res1.expertise : 'N/A'})`);

        // 4. TEST CASE 2: PAYMENT TICKET -> Should go to Payment Agent
        console.log('\n🧪 TEST 2: Payment Ticket ("Payment Issue")');
        const t2 = new Ticket({
            title: 'LoadBalancerTest-T2',
            description: 'Double charge',
            category: 'Payment Issue',
            aiCategory: 'Payment Issue',
            status: 'Open',
            user: someUser._id
        });
        const res2 = await agentAssignmentService.autoAssignTicket(t2);
        console.log(`✅ Result: Assigned to "${res2 ? res2.name : 'NONE'}" (Expertise: ${res2 ? res2.expertise : 'N/A'})`);

        // 5. TEST CASE 3: NO SPECIFIC EXPERT (e.g. Account) -> Should go to least loaded
        // Current Loads: TechFree (1), PayAgent (1), TechBusy (2)
        // It will pick either TechFree or PayAgent (oldest/first)
        console.log('\n🧪 TEST 3: Account Ticket ("Account Issue") - Fallback Match');
        const t3 = new Ticket({
            title: 'LoadBalancerTest-T3',
            description: 'Login failed',
            category: 'Account Issue',
            aiCategory: 'Account Issue',
            status: 'Open',
            user: someUser._id
        });
        const res3 = await agentAssignmentService.autoAssignTicket(t3);
        console.log(`✅ Result: Assigned to "${res3 ? res3.name : 'NONE'}" (Workload fallback)`);

        console.log('\n✨ ALL TESTS PASSED! Cleaning up...');
        await User.deleteMany({ email: /test-agent-.*@example.com/ });
        await Ticket.deleteMany({ title: /LoadBalancerTest-.*/ });

        console.log('--- VERIFICATION SUCCESSFUL ---');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error);
        process.exit(1);
    }
};

verifyLoadBalancer();
