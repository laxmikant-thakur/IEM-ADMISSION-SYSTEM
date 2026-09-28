const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/applicationController');
const { isAuthenticated, isApplicant } = require('../middleware/authMiddleware');
const { handleUpload } = require('../middleware/uploadMiddleware');

// All application routes require authentication + applicant role
router.use(isAuthenticated, isApplicant);

// Submit application (multipart/form-data with documents)
router.post('/', handleUpload, ApplicationController.submit);

// Get own application
router.get('/me', ApplicationController.getMyApplication);

// Get own application status
router.get('/status', ApplicationController.getMyStatus);

module.exports = router;
