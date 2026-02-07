const express = require('express');
const router = express.Router();
const { analyzeContent } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/analyze', protect, analyzeContent);

module.exports = router;
