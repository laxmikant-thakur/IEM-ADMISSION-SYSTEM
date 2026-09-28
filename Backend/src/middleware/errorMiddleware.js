const { sendError } = require('../utils/response');

/**
 * Global error handling middleware
 * Must be registered after all routes
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Unhandled error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = {};
        for (const field of Object.keys(err.errors)) {
            errors[field] = err.errors[field].message;
        }
        return sendError(res, 400, 'Validation error', errors);
    }

    // MySQL duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
        return sendError(res, 409, 'Duplicate entry detected');
    }

    // Default server error
    return sendError(
        res,
        err.statusCode || 500,
        err.message || 'Internal server error'
    );
};

/**
 * 404 handler for unknown routes
 */
const notFoundHandler = (req, res) => {
    return sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};

module.exports = { errorHandler, notFoundHandler };
