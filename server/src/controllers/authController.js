const User = require('../models/User');
const generateToken = require('../utils/jwt');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;



        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please provide name, email, and password');
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists with this email');
        }

        // SECURITY: Always create with 'user' role - admin/agent cannot be created via API
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: 'user',
        });



        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            },
        });
    } catch (error) {
        console.error('[Auth] Register error:', error);
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;



        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {

            res.status(401);
            throw new Error('Invalid email or password');
        }

        if (!(await user.matchPassword(password))) {

            res.status(401);
            throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
            res.status(401);
            throw new Error('Account is deactivated');
        }



        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            },
        });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        next(error);
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all agents (Admin only)
 * @route   GET /api/auth/agents
 * @access  Private/Admin
 */
const getAgents = async (req, res, next) => {
    try {
        const agents = await User.find({ role: 'agent' }).select('-password');

        res.json({
            success: true,
            count: agents.length,
            data: agents,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/auth/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['user', 'agent'].includes(role)) {
            res.status(400);
            throw new Error('Invalid role. Can only assign user or agent role.');
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Cannot change admin role
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot change admin role');
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Deactivate user (Admin only)
 * @route   PUT /api/auth/users/:id/deactivate
 * @access  Private/Admin
 */
const deactivateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot deactivate admin');
        }

        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: 'User deactivated',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update agent expertise (Admin only)
 * @route   PUT /api/auth/users/:id/expertise
 * @access  Private/Admin
 */
const updateUserExpertise = async (req, res, next) => {
    try {
        const { expertise } = req.body;
        const validExpertise = ['payment', 'technical', 'account', 'general'];

        // Validate expertise array
        if (!Array.isArray(expertise) || expertise.length === 0) {
            res.status(400);
            throw new Error('Expertise must be a non-empty array');
        }

        // Validate each expertise value
        const invalidItems = expertise.filter(e => !validExpertise.includes(e));
        if (invalidItems.length > 0) {
            res.status(400);
            throw new Error(`Invalid expertise values: ${invalidItems.join(', ')}`);
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Only agents can have expertise
        if (user.role !== 'agent') {
            res.status(400);
            throw new Error('Only agents can have expertise assigned');
        }

        user.expertise = expertise;
        await user.save();

        console.log(`[Audit Log] Admin ${req.user._id} updated expertise for agent ${user._id} to: [${expertise.join(', ')}]`);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                expertise: user.expertise
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
    getAgents,
    updateUserRole,
    deactivateUser,
    updateUserExpertise,
};
