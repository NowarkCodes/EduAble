const express = require('express');
const authMiddleware = require('../middleware/auth');
const { createProfile, getProfile } = require('../controllers/profileController');

const router = express.Router();

router.post('/create', authMiddleware, createProfile);
router.get('/:userId', authMiddleware, getProfile);

module.exports = router;
