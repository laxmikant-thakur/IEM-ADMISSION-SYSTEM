const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/departmentController');

// Public route — used by applicant application form for department dropdown
router.get('/', DepartmentController.getDepartmentList);

module.exports = router;
