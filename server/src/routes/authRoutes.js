const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
    getAgents,
    updateUserRole,
    deactivateUser,
    updateUserExpertise,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);

// Admin routes
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/agents', protect, adminOnly, getAgents);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.put('/users/:id/deactivate', protect, adminOnly, deactivateUser);
router.put('/users/:id/expertise', protect, adminOnly, updateUserExpertise);

module.exports = router;
