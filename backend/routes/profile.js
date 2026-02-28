const express = require('express');
const authMiddleware = require('../middleware/auth');
const { createProfile, getProfile, getAccessibility, patchAccessibility, updateProfile } = require('../controllers/profileController');

const router = express.Router();

router.post('/create', authMiddleware, createProfile);

// PATCH /me — update name, bio, phone, password
router.patch('/me', authMiddleware, updateProfile);

// Must be before /:userId so 'accessibility' literal isn't treated as a userId
router.get('/accessibility', authMiddleware, getAccessibility);
router.patch('/accessibility', authMiddleware, patchAccessibility);

router.get('/:userId', authMiddleware, getProfile);

module.exports = router;
