const AuthService = require('../services/authService');
const AdminService = require('../services/adminService');
const DocumentService = require('../services/documentService');
const { sendSuccess, sendError } = require('../utils/response');
const mongoose = require('mongoose');

/**
 * Admin Controller — handles admin HTTP requests
 */
const AdminController = {
    /**
     * POST /api/admin/login
     */
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return sendError(res, 400, 'Email and password are required');
            }

            const admin = await AuthService.loginAdmin({ email, password });

            // Create session
            req.session.userId = admin.id;
            req.session.role = 'admin';
            req.session.userName = admin.name;

            return sendSuccess(res, 200, 'Admin login successful', {
                user: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: 'admin'
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
     * POST /api/admin/logout
     */
    logout: async (req, res, next) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    return sendError(res, 500, 'Failed to logout');
                }
                res.clearCookie('connect.sid');
                return sendSuccess(res, 200, 'Admin logged out successfully');
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/me
     */
    getMe: async (req, res, next) => {
        try {
            const user = await AuthService.getCurrentUser(req.session);
            if (!user) {
                return sendError(res, 401, 'Not authenticated');
            }

            return sendSuccess(res, 200, 'Admin retrieved', {
                user: {
                    ...user,
                    role: 'admin'
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/applications
     */
    getApplications: async (req, res, next) => {
        try {
            const { status, department_id } = req.query;
            const filters = {};
            if (status) filters.status = status;
            if (department_id) filters.department_id = parseInt(department_id, 10);

            const applications = await AdminService.getAllApplications(filters);

            return sendSuccess(res, 200, 'Applications retrieved', { applications });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/applications/:id
     */
    getApplicationDetails: async (req, res, next) => {
        try {
            const applicationId = parseInt(req.params.id, 10);
            if (isNaN(applicationId)) {
                return sendError(res, 400, 'Invalid application ID');
            }

            const application = await AdminService.getApplicationDetails(applicationId);

            return sendSuccess(res, 200, 'Application details retrieved', { application });
        } catch (error) {
            if (error.statusCode) {
                return sendError(res, error.statusCode, error.message);
            }
            next(error);
        }
    },

    /**
     * GET /api/admin/applications/:id/documents
     */
    getApplicationDocuments: async (req, res, next) => {
        try {
            const applicationId = parseInt(req.params.id, 10);
            if (isNaN(applicationId)) {
                return sendError(res, 400, 'Invalid application ID');
            }

            const documents = await AdminService.getApplicationDocuments(applicationId);

            return sendSuccess(res, 200, 'Documents retrieved', { documents });
        } catch (error) {
            if (error.statusCode) {
                return sendError(res, error.statusCode, error.message);
            }
            next(error);
        }
    },

    /**
     * GET /api/admin/documents/:documentId/download
     */
    downloadDocument: async (req, res, next) => {
        try {
            const { documentId } = req.params;

            const doc = await DocumentService.getDocumentById(documentId);
            if (!doc) {
                return sendError(res, 404, 'Document not found');
            }

            res.set({
                'Content-Type': doc.mimeType,
                'Content-Disposition': `inline; filename="${doc.originalName}"`,
            });

            const downloadStream = DocumentService.getFileStream(
                new mongoose.Types.ObjectId(doc.gridfsFileId)
            );

            downloadStream.on('error', (err) => {
                console.error('GridFS download error:', err);
                return sendError(res, 500, 'Failed to download document');
            });

            downloadStream.pipe(res);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/admin/applications/:id/accept
     */
    acceptApplication: async (req, res, next) => {
        try {
            const applicationId = parseInt(req.params.id, 10);
            if (isNaN(applicationId)) {
                return sendError(res, 400, 'Invalid application ID');
            }

            const result = await AdminService.acceptApplication(applicationId);

            return sendSuccess(res, 200, 'Application accepted', result);
        } catch (error) {
            if (error.statusCode) {
                return sendError(res, error.statusCode, error.message);
            }
            next(error);
        }
    },

    /**
     * PATCH /api/admin/applications/:id/reject
     */
    rejectApplication: async (req, res, next) => {
        try {
            const applicationId = parseInt(req.params.id, 10);
            if (isNaN(applicationId)) {
                return sendError(res, 400, 'Invalid application ID');
            }

            const { rejectionReason } = req.body;

            const result = await AdminService.rejectApplication(applicationId, rejectionReason);

            return sendSuccess(res, 200, 'Application rejected', result);
        } catch (error) {
            if (error.statusCode) {
                return sendError(res, error.statusCode, error.message, error.errors);
            }
            next(error);
        }
    },

    /**
     * GET /api/admin/students
     */
    getStudents: async (req, res, next) => {
        try {
            const { status, department_id } = req.query;
            const filters = {};
            if (status) filters.status = status;
            if (department_id) filters.department_id = parseInt(department_id, 10);

            const students = await AdminService.getStudents(filters);

            return sendSuccess(res, 200, 'Students retrieved', { students });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/dashboard-stats
     */
    getDashboardStats: async (req, res, next) => {
        try {
            const stats = await AdminService.getDashboardStats();

            return sendSuccess(res, 200, 'Dashboard stats retrieved', { stats });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = AdminController;
