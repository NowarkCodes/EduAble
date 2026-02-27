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
