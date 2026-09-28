const ApplicationService = require('../services/applicationService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Application Controller — handles application HTTP requests
 */
const ApplicationController = {
    /**
     * POST /api/applications
     * Submit a new application (multipart/form-data)
     */
    submit: async (req, res, next) => {
        try {
            const applicantId = req.session.userId;
            const formData = req.body;
            const files = req.files;

            const result = await ApplicationService.submitApplication(
                applicantId, formData, files
            );

            return sendSuccess(res, 201, 'Application submitted successfully', result);
        } catch (error) {
            if (error.statusCode) {
                return sendError(res, error.statusCode, error.message, error.errors);
            }
            next(error);
        }
    },

    /**
     * GET /api/applications/me
     * Get the authenticated applicant's application
     */
    getMyApplication: async (req, res, next) => {
        try {
            const applicantId = req.session.userId;
            const application = await ApplicationService.getMyApplication(applicantId);

            if (!application) {
                return sendSuccess(res, 200, 'No application found', { application: null });
            }

            return sendSuccess(res, 200, 'Application retrieved', { application });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/applications/status
     * Get the authenticated applicant's application status
     */
    getMyStatus: async (req, res, next) => {
        try {
            const applicantId = req.session.userId;
            const status = await ApplicationService.getMyStatus(applicantId);

            if (!status) {
                return sendSuccess(res, 200, 'No application found', { status: null });
            }

            return sendSuccess(res, 200, 'Status retrieved', { status });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = ApplicationController;
