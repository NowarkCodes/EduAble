const AccessibilityProfile = require('../models/AccessibilityProfile');

/**
 * Middleware: Fetches the user's AccessibilityProfile and attaches it to req.a11y.
 * Must be used AFTER authMiddleware so req.user is populated.
 * Non-blocking — if no profile exists, req.a11y is set to null.
 */
module.exports = async function accessibilityMiddleware(req, _res, next) {
    try {
        const profile = await AccessibilityProfile.findOne({ userId: req.user._id }).lean();
        req.a11y = profile || null;
    } catch {
        req.a11y = null;
    }
    next();
};
