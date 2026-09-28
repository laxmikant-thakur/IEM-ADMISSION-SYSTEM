const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.post('/logout', isAuthenticated, AuthController.logout);
router.get('/me', isAuthenticated, AuthController.getMe);

module.exports = router;
