const ApplicationModel = require('../models/applicationModel');
const DepartmentModel = require('../models/departmentModel');
const DocumentService = require('./documentService');
const { validateApplication } = require('../utils/validation');
const { isDeadlinePassed, transitionSubmittedApplications } = require('../utils/deadline');

/**
 * Application Service — handles application business logic
 */
const ApplicationService = {
    /**
     * Submit a new application
     */
    submitApplication: async (applicantId, formData, files) => {
        // 1. Check deadline
        const deadlinePassed = await isDeadlinePassed();
        if (deadlinePassed) {
            const error = new Error('Application deadline has passed');
            error.statusCode = 400;
            throw error;
        }

        // 2. Check for duplicate application
        const existingApp = await ApplicationModel.findByApplicantId(applicantId);
        if (existingApp) {
            const error = new Error('You have already submitted an application');
            error.statusCode = 409;
            throw error;
        }

        // 3. Validate form data
        const validationErrors = validateApplication(formData);
        if (validationErrors) {
            const error = new Error('Application validation failed');
            error.statusCode = 400;
            error.errors = validationErrors;
            throw error;
        }

        // 4. Verify department exists
        const department = await DepartmentModel.findById(formData.department_id);
        if (!department) {
            const error = new Error('Selected department does not exist');
            error.statusCode = 400;
            error.errors = { department_id: 'Invalid department selection' };
            throw error;
        }

        // 5. Validate required documents are present
        const requiredDocs = ['photo', 'tenth_marksheet', 'twelfth_marksheet', 'aadhaar_card'];
        const missingDocs = {};
        for (const doc of requiredDocs) {
            if (!files || !files[doc] || !files[doc][0]) {
                missingDocs[doc] = `${doc.replace(/_/g, ' ')} is required`;
            }
        }
        if (Object.keys(missingDocs).length > 0) {
            const error = new Error('Required documents are missing');
            error.statusCode = 400;
            error.errors = missingDocs;
            throw error;
        }

        // 6. Create application record in MySQL
        const applicationId = await ApplicationModel.create({
            applicant_id: applicantId,
            ...formData
        });

        // 7. Upload documents to GridFS + create metadata
        const uploadedDocs = await DocumentService.uploadMultipleDocuments(
            files, applicationId, applicantId
        );

        return {
            applicationId,
            status: 'Submitted',
            documentsUploaded: uploadedDocs.length
        };
    },

    /**
     * Get application for the authenticated applicant
     */
    getMyApplication: async (applicantId) => {
        // Run lazy transition check
        await transitionSubmittedApplications();

        const application = await ApplicationModel.findByApplicantId(applicantId);
        if (!application) {
            return null;
        }

        // Get associated documents
        const documents = await DocumentService.getDocumentsByApplicationId(application.id);

        return {
            ...application,
            documents
        };
    },

    /**
     * Get application status for the authenticated applicant
     */
    getMyStatus: async (applicantId) => {
        // Run lazy transition check
        await transitionSubmittedApplications();

        return await ApplicationModel.getStatusByApplicantId(applicantId);
    }
};

module.exports = ApplicationService;
