/**
 * Centralized error-handling middleware.
 * Must be registered LAST in server.js (after all routes).
 */
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, _req, res, _next) {
    console.error('[UNHANDLED ERROR]', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ error: messages.join('. ') });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({ error: `Duplicate value for ${field}.` });
    }

    // Mongoose cast error (invalid ObjectId etc.)
    if (err.name === 'CastError') {
        return res.status(400).json({ error: `Invalid value for ${err.path}.` });
    }

    // JWT errors surfaced by controllers
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message || 'Internal server error.',
    });
};
