/**
 * Wraps async route handlers so thrown errors are forwarded to Express's
 * centralized error handler instead of crashing the server.
 *
 * Usage:
 *   router.get('/route', authMiddleware, asyncHandler(myController))
 */
module.exports = function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
