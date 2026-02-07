const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate JWT token with user ID and role
 * @param {string} id - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        config.jwtSecret,
        { expiresIn: '30d' }
    );
};

module.exports = generateToken;
