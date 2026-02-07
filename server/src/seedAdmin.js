const User = require('./models/User');
const config = require('./config/env');

/**
 * Seed admin user on server startup
 * SECURITY: Only ONE admin is allowed
 * Credentials are read from environment variables
 */
const seedAdmin = async () => {
    try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
        const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

        // Validate required environment variables
        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.log('⚠️  Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
            return;
        }

        // SECURITY: Check if ANY admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log('✓ Admin already exists:', existingAdmin.email);
            return;
        }

        // Check if email is already taken by a regular user
        const emailTaken = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

        if (emailTaken) {
            // Promote existing user to admin
            emailTaken.role = 'admin';
            await emailTaken.save();
            console.log('✓ Existing user promoted to admin:', ADMIN_EMAIL);
            return;
        }

        // Create new admin user
        const admin = await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL.toLowerCase(),
            password: ADMIN_PASSWORD,
            role: 'admin',
        });

        console.log('');
        console.log('═══════════════════════════════════════════════');
        console.log('  ✓ ADMIN USER CREATED SUCCESSFULLY');
        console.log('═══════════════════════════════════════════════');
        console.log(`  Email:    ${admin.email}`);
        console.log(`  Password: ${ADMIN_PASSWORD}`);
        console.log('  ⚠️  Change default password after first login!');
        console.log('═══════════════════════════════════════════════');
        console.log('');

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

module.exports = seedAdmin;
