const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const DepartmentController = require('../controllers/departmentController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Public admin routes
router.post('/login', AdminController.login);

// All other admin routes require authentication + admin role
router.use(isAuthenticated, isAdmin);

router.post('/logout', AdminController.logout);
router.get('/me', AdminController.getMe);

// Dashboard stats
router.get('/dashboard-stats', AdminController.getDashboardStats);

// Application management
router.get('/applications', AdminController.getApplications);
router.get('/applications/:id', AdminController.getApplicationDetails);
router.get('/applications/:id/documents', AdminController.getApplicationDocuments);
router.patch('/applications/:id/accept', AdminController.acceptApplication);
router.patch('/applications/:id/reject', AdminController.rejectApplication);

// Students
router.get('/students', AdminController.getStudents);

// Document download
router.get('/documents/:documentId/download', AdminController.downloadDocument);

// Department seats
router.get('/departments/seats', DepartmentController.getSeats);
router.patch('/departments/:id/seats', DepartmentController.updateSeats);

// Settings
router.get('/settings/deadline', DepartmentController.getDeadline);
router.patch('/settings/deadline', DepartmentController.updateDeadline);

module.exports = router;
