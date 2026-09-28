const AuthService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');
const { validateRegistration } = require('../utils/validation');

/**
 * Auth Controller — handles authentication HTTP requests
 */
const AuthController = {
    /**
     * POST /api/auth/register
     */
    register: async (req, res, next) => {
        try {
            // Validate registration data
            const errors = validateRegistration(req.body);
            if (errors) {
                return sendError(res, 400, 'Registration validation failed', errors);
            }

            const applicantId = await AuthService.register(req.body);

            return sendSuccess(res, 201, 'Registration successful', {
                applicantId
            });
        } catch (error) {
            if (error.statusCode) {
                return sendError(res, error.statusCode, error.message, error.errors);
            }
            next(error);
        }
    },

    /**
     * POST /api/auth/login
     */
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return sendError(res, 400, 'Email and password are required');
            }

            const user = await AuthService.loginApplicant({ email, password });

            // Create session
            req.session.userId = user.id;
            req.session.role = 'applicant';
            req.session.userName = user.name;

            return sendSuccess(res, 200, 'Login successful', {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: 'applicant'
                }
            });
        } catch (error) {
            if (error.statusCode) {
                return sendError(res, error.statusCode, error.message);
            }
            next(error);
        }
    },

    /**
     * POST /api/auth/logout
     */
    logout: async (req, res, next) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    return sendError(res, 500, 'Failed to logout');
                }
                res.clearCookie('connect.sid');
                return sendSuccess(res, 200, 'Logged out successfully');
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/auth/me
     */
    getMe: async (req, res, next) => {
        try {
            const user = await AuthService.getCurrentUser(req.session);
            if (!user) {
                return sendError(res, 401, 'Not authenticated');
            }

            return sendSuccess(res, 200, 'User retrieved', {
                user: {
                    ...user,
                    role: req.session.role
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = AuthController;
