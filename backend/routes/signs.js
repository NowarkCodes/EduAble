const express = require('express');
const router = express.Router();
const { lookupSigns } = require('../controllers/signsController');
const { protect } = require('../middleware/auth');

/**
 * Signs vocabulary routes.
 * Mount point: /api/signs
 *
 * Phase 2 — Sign Language Overlay support.
 */

// GET /api/signs/lookup?words=hello,learn&lang=ISL
// Protected: the student must be authenticated (prevents open scraping)
router.get('/lookup', protect, lookupSigns);

module.exports = router;
