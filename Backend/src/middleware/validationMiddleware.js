const { sendError } = require('../utils/response');

/**
 * Validation middleware factory
 * Takes a validation function and returns middleware that validates req.body
 */
const validate = (validationFn) => {
    return (req, res, next) => {
        const errors = validationFn(req.body);
        if (errors) {
            return sendError(res, 400, 'Validation failed', errors);
        }
        next();
    };
};

module.exports = { validate };
