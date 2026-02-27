const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { getStats, updateStats } = require('../controllers/ngoController');

const router = express.Router();

// Public stat read (NGO dashboard widget, landing page counter, etc.)
router.get('/stats', getStats);

// Only admin/ngo users can mutate NGO stats
router.patch('/stats', authMiddleware, requireRole('admin', 'ngo'), updateStats);

module.exports = router;
