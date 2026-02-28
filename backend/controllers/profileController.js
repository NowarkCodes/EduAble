const AccessibilityProfile = require('../models/AccessibilityProfile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.createProfile = asyncHandler(async (req, res) => {
    const {
        contactNumber,
        age,
        preferredLanguage,
        disabilityType,
        accessibilityPreferences,
    } = req.body;

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

    await User.findByIdAndUpdate(req.user._id, { onboardingCompleted: true });

    res.status(201).json({
        message: 'Accessibility profile saved successfully.',
        profile,
    });
});

exports.getProfile = asyncHandler(async (req, res) => {
    if (req.params.userId !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied.' });
    }

    const profile = await AccessibilityProfile.findOne({ userId: req.params.userId });

    if (!profile) {
        return res.status(404).json({ error: 'Profile not found.' });
    }

    res.json({ profile });
});

/* ── GET /api/profile/accessibility ────────────────────────────────────────
   Returns the current user's accessibilityPreferences object.
   Creates a blank profile if one doesn't exist yet (upsert-safe).
*/
exports.getAccessibility = asyncHandler(async (req, res) => {
    let profile = await AccessibilityProfile.findOne({ userId: req.user._id });

    if (!profile) {
        // Return empty defaults — profile is created on first PATCH
        return res.json({
            accessibilityPreferences: {
                signLanguageSupport: false,
                gestureNavigationEnabled: false,
                preferredSignLanguage: 'none',
                signOverlayPosition: 'bottom-left',
            }
        });
    }

    res.json({ accessibilityPreferences: profile.accessibilityPreferences });
});

/* ── PATCH /api/profile/accessibility ──────────────────────────────────────
   Merges the supplied accessibilityPreferences keys into the stored profile.
   Only the supplied keys are updated; others are left untouched.
*/
exports.patchAccessibility = asyncHandler(async (req, res) => {
    const incoming = req.body?.accessibilityPreferences;
    if (!incoming || typeof incoming !== 'object') {
        return res.status(400).json({ error: 'accessibilityPreferences object required' });
    }

    // Build a $set map that only touches the provided keys
    const setMap = {};
    for (const [key, value] of Object.entries(incoming)) {
        setMap[`accessibilityPreferences.${key}`] = value;
    }

    const profile = await AccessibilityProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: setMap },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ accessibilityPreferences: profile.accessibilityPreferences });
});
