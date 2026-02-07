const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const config = require('../config/env');

/**
 * @desc    Protect routes - verify JWT token
 * @access  Private
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, config.jwtSecret);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }

            if (!req.user.isActive) {
                res.status(401);
                throw new Error('Account is deactivated');
            }

            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }
});

/**
 * @desc    Admin only middleware
 * @access  Private/Admin
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Access denied. Admin privileges required.');
    }
};

/**
 * @desc    Agent only middleware
 * @access  Private/Agent
 */
const agentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'agent') {
        next();
    } else {
        res.status(403);
        throw new Error('Access denied. Agent privileges required.');
    }
};

/**
 * @desc    Admin or Agent middleware
 * @access  Private/Admin|Agent
 */
const adminOrAgent = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'agent')) {
        next();
    } else {
        res.status(403);
        throw new Error('Access denied. Admin or Agent privileges required.');
    }
};

/**
 * @desc    User only middleware (blocks admin/agent)
 * @access  Private/User
 */
const userOnly = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(403);
        throw new Error('Access denied. User privileges required.');
    }
};

module.exports = { protect, adminOnly, agentOnly, adminOrAgent, userOnly };
