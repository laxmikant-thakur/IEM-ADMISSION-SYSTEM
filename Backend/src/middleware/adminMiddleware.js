const { sendError } = require('../utils/response');

/**
 * Check if the authenticated user is an admin
 */
const isAdmin = (req, res, next) => {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    return sendError(res, 403, 'Access denied. Admin role required.');
};

module.exports = { isAdmin };
