const express = require('express');
const authMiddleware = require('../middleware/auth');
const AccessibilityProfile = require('../models/AccessibilityProfile');
const User = require('../models/User');

const router = express.Router();

/* ────────────────────────────────────────────────────────────
   POST /api/profile/create  (protected)
   Body: { contactNumber, age, preferredLanguage,
           disabilityType[], accessibilityPreferences{} }
──────────────────────────────────────────────────────────── */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const {
      contactNumber,
      age,
      preferredLanguage,
      disabilityType,
      accessibilityPreferences,
    } = req.body;

    // Upsert profile (one profile per user)
    const profile = await AccessibilityProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        contactNumber: contactNumber || '',
        age: age || null,
        preferredLanguage: preferredLanguage || 'English',
        disabilityType: disabilityType || [],
        accessibilityPreferences: accessibilityPreferences || {},
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Mark onboarding as complete on the User document
    await User.findByIdAndUpdate(req.user._id, { onboardingCompleted: true });

    res.status(201).json({
      message: 'Accessibility profile saved successfully.',
      profile,
    });
  } catch (err) {
    console.error('[profile/create]', err);
    res.status(500).json({ error: 'Could not save profile. Please try again.' });
  }
});

/* ────────────────────────────────────────────────────────────
   GET /api/profile/:userId  (protected)
──────────────────────────────────────────────────────────── */
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    // Users can only fetch their own profile
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const profile = await AccessibilityProfile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    res.json({ profile });
  } catch (err) {
    console.error('[profile/get]', err);
    res.status(500).json({ error: 'Could not fetch profile. Please try again.' });
  }
});

module.exports = router;
