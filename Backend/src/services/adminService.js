const { getPool } = require('../config/mysql');
const ApplicationModel = require('../models/applicationModel');
const DepartmentModel = require('../models/departmentModel');
const DocumentService = require('./documentService');
const { transitionSubmittedApplications } = require('../utils/deadline');

/**
 * Admin Service — handles admin business logic
 */
const AdminService = {
    /**
     * Get all applications (with optional status + department filter)
     */
    getAllApplications: async (filters = {}) => {
        // Run lazy transition check
        await transitionSubmittedApplications();

        return await ApplicationModel.findAll(filters);
    },

    /**
     * Get application details by ID (for admin review)
     */
    getApplicationDetails: async (applicationId) => {
        // Run lazy transition check
        await transitionSubmittedApplications();

        const application = await ApplicationModel.findById(applicationId);
        if (!application) {
            const error = new Error('Application not found');
            error.statusCode = 404;
            throw error;
        }

        // Get associated documents
        const documents = await DocumentService.getDocumentsByApplicationId(applicationId);

        return {
            ...application,
            documents
        };
    },

    /**
     * Accept an application
     * Uses MySQL transaction for atomic status update + seat decrement
     */
    acceptApplication: async (applicationId) => {
        const pool = getPool();

        // Run lazy transition first
        await transitionSubmittedApplications();

        const application = await ApplicationModel.findById(applicationId);
        if (!application) {
            const error = new Error('Application not found');
            error.statusCode = 404;
            throw error;
        }

        if (application.status !== 'Under Review') {
            const error = new Error(`Cannot accept application with status "${application.status}". Only "Under Review" applications can be accepted.`);
            error.statusCode = 400;
            throw error;
        }

        // Use transaction for atomicity
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Update application status
            await connection.query(
                'UPDATE applications SET status = ? WHERE id = ?',
                ['Accepted', applicationId]
            );

            // Decrement department seats (with row lock + safety check)
            await DepartmentModel.decrementSeats(application.department_id, connection);

            await connection.commit();

            return {
                applicationId,
                status: 'Accepted',
                department: application.department_name
            };
        } catch (err) {
            await connection.rollback();
            if (err.message.includes('No seats available')) {
                const error = new Error(`No seats available in ${application.department_name}`);
                error.statusCode = 400;
                throw error;
            }
            throw err;
        } finally {
            connection.release();
        }
    },

    /**
     * Reject an application with a reason
     */
    rejectApplication: async (applicationId, rejectionReason) => {
        // Run lazy transition first
        await transitionSubmittedApplications();

        const application = await ApplicationModel.findById(applicationId);
        if (!application) {
            const error = new Error('Application not found');
            error.statusCode = 404;
            throw error;
        }

        if (application.status !== 'Under Review') {
            const error = new Error(`Cannot reject application with status "${application.status}". Only "Under Review" applications can be rejected.`);
            error.statusCode = 400;
            throw error;
        }

        if (!rejectionReason || rejectionReason.trim().length < 5) {
            const error = new Error('Rejection reason is required (minimum 5 characters)');
            error.statusCode = 400;
            error.errors = { rejectionReason: 'Please provide a detailed reason for rejection' };
            throw error;
        }

        await ApplicationModel.updateStatus(applicationId, 'Rejected', rejectionReason.trim());

        return {
            applicationId,
            status: 'Rejected',
            rejectionReason: rejectionReason.trim()
        };
    },

    /**
     * Get documents for an application
     */
    getApplicationDocuments: async (applicationId) => {
        const application = await ApplicationModel.findById(applicationId);
        if (!application) {
            const error = new Error('Application not found');
            error.statusCode = 404;
            throw error;
        }

        return await DocumentService.getDocumentsByApplicationId(applicationId);
    },

    /**
     * Get students with filters (status, department)
     */
    getStudents: async (filters = {}) => {
        await transitionSubmittedApplications();
        return await ApplicationModel.findStudents(filters);
    },

    /**
     * Get dashboard statistics
     */
    getDashboardStats: async () => {
        await transitionSubmittedApplications();
        return await ApplicationModel.getDashboardStats();
    }
};

module.exports = AdminService;
