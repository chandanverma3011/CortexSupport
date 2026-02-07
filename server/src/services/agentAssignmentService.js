const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');

/**
 * Service to handle automatic ticket assignment to agents
 */
const agentAssignmentService = {
    /**
     * Auto-assigns a ticket based on category expertise and current workload
     * @param {Object} ticket - The ticket document to assign
     */
    autoAssignTicket: async (ticket) => {
        try {
            console.log(`[Load Balancer] Attempting auto-assignment for ticket: "${ticket.title}" (Category: ${ticket.aiCategory || ticket.category})`);

            // 1. Determine target category (Prefer AI category)
            const targetCategory = (ticket.aiCategory || ticket.category || 'General Query').toLowerCase();

            // Map ticket categories to agent expertise strings
            const categoryMap = {
                'bug': 'technical',
                'payment issue': 'payment',
                'account issue': 'account',
                'feature request': 'technical',
                'general query': 'general'
            };

            // Handle case where category might be null or mixed case
            const cleanCategory = targetCategory.toLowerCase();
            const expertiseMatch = categoryMap[cleanCategory] || 'general';

            // 2. Find eligible agents (role: agent, isActive: true)
            // 3. Count their active workloads (Open, In Progress)
            // 4. Sort by workload (Ascending)
            const eligibleAgents = await User.aggregate([
                {
                    $match: {
                        role: 'agent',
                        isActive: true
                    }
                },
                {
                    $lookup: {
                        from: 'tickets',
                        let: { agentId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$assignedTo', '$$agentId'] },
                                            { $in: ['$status', ['Open', 'In Progress']] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'activeTickets'
                    }
                },
                {
                    $project: {
                        name: 1,
                        email: 1,
                        expertise: 1,
                        workload: { $size: '$activeTickets' }
                    }
                },
                { $sort: { workload: 1, createdAt: 1 } } // Fairness: Least workload, then oldest agent
            ]);

            if (eligibleAgents.length === 0) {
                console.warn('[Load Balancer] No active agents found. Ticket remains unassigned.');

                // NOTIFY ADMINS: "If no agents are active, leave ticket unassigned and notify admin"
                const admins = await User.find({ role: 'admin' });
                for (const admin of admins) {
                    await Notification.create({
                        user: admin._id,
                        type: 'TICKET_UNASSIGNED',
                        message: `CRITICAL: No active agents available to handle new ticket: "${ticket.title}"`,
                        ticket: ticket._id,
                    });
                }
                return null;
            }

            // 5. Try to find an expert match first
            let bestAgent = eligibleAgents.find(agent => {
                const agentExpertise = Array.isArray(agent.expertise) ? agent.expertise : [];
                return agentExpertise.includes(expertiseMatch);
            });

            // 6. Fallback: If no expert, pick the least loaded agent overall
            if (!bestAgent) {
                console.log(`[Load Balancer] No agent found with expertise "${expertiseMatch}". Falling back to least-loaded overall.`);
                bestAgent = eligibleAgents[0];
            }

            // 7. Perform the assignment
            ticket.assignedTo = bestAgent._id;
            if (ticket.status === 'Open') {
                ticket.status = 'In Progress';
            }
            await ticket.save();

            // AUDIT: Formal log of the automated decision
            const isExpertMatch = Array.isArray(bestAgent.expertise) && bestAgent.expertise.includes(expertiseMatch);
            console.log(`[Audit Log] Ticket "${ticket.title}" (${ticket._id}) AUTO-ASSIGNED to Agent: ${bestAgent.name} (${bestAgent._id}). Strategy: ${isExpertMatch ? 'Expertise Match' : 'Load-Balancer Fallback'}. Current Workload: ${bestAgent.workload}`);

            // 8. Notify Agent
            await Notification.create({
                user: bestAgent._id,
                type: 'TICKET_ASSIGNED',
                message: `Auto-assigned: "${ticket.title}" (Matched via ${bestAgent.expertise.includes(expertiseMatch) ? 'Expertise' : 'Load Balancer Fallback'})`,
                ticket: ticket._id,
            });

            return bestAgent;

        } catch (error) {
            console.error('[Load Balancer] Assignment Error:', error.message);
            return null;
        }
    }
};

module.exports = agentAssignmentService;
