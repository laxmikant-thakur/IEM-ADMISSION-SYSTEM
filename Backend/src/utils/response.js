/**
 * Send a successful API response
 */
const sendSuccess = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message
    };
    if (data !== null) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
};

/**
 * Send an error API response
 */
const sendError = (res, statusCode, message, errors = null) => {
    const response = {
        success: false,
        message
    };
    if (errors !== null) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
