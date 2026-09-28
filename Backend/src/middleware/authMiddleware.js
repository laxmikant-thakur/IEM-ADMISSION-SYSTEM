const { sendError } = require('../utils/response');

/**
 * Check if user is authenticated (has a valid session)
 */
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return sendError(res, 401, 'Authentication required. Please log in.');
};

/**
 * Check if the authenticated user is an applicant
 */
const isApplicant = (req, res, next) => {
    if (req.session && req.session.role === 'applicant') {
        return next();
    }
    return sendError(res, 403, 'Access denied. Applicant role required.');
};

module.exports = { isAuthenticated, isApplicant };
