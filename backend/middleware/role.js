/**
 * Middleware: Restricts access to users whose role matches one of the allowed roles.
 * Attach `role` field to the User model and populate it in authMiddleware
 * before using this guard.
 *
 * Usage:
 *   router.get('/admin-route', authMiddleware, requireRole('admin', 'ngo'), handler)
 */
module.exports = function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access restricted. Required role: ${roles.join(' or ')}.`,
            });
        }
        next();
    };
};
