const bcrypt = require('bcryptjs');
const ApplicantModel = require('../models/applicantModel');
const AdminModel = require('../models/adminModel');

/**
 * Auth Service — handles authentication business logic
 */
const AuthService = {
    /**
     * Register a new applicant
     */
    register: async ({ name, email, password, phone }) => {
        // Check if email already exists
        const existing = await ApplicantModel.findByEmail(email);
        if (existing) {
            const error = new Error('Email already registered');
            error.statusCode = 409;
            error.errors = { email: 'This email is already registered' };
            throw error;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create applicant
        const applicantId = await ApplicantModel.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            phone: phone.trim()
        });

        return applicantId;
    },

    /**
     * Authenticate an applicant
     */
    loginApplicant: async ({ email, password }) => {
        const applicant = await ApplicantModel.findByEmail(email.trim().toLowerCase());
        if (!applicant) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, applicant.password);
        if (!isMatch) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        return {
            id: applicant.id,
            name: applicant.name,
            email: applicant.email,
            phone: applicant.phone,
            role: 'applicant'
        };
    },

    /**
     * Authenticate an admin
     */
    loginAdmin: async ({ email, password }) => {
        const admin = await AdminModel.findByEmail(email.trim().toLowerCase());
        if (!admin) {
            const error = new Error('Invalid admin credentials');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            const error = new Error('Invalid admin credentials');
            error.statusCode = 401;
            throw error;
        }

        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: 'admin'
        };
    },

    /**
     * Get current user info from session
     */
    getCurrentUser: async (session) => {
        if (!session || !session.userId) {
            return null;
        }

        if (session.role === 'admin') {
            return await AdminModel.findById(session.userId);
        }

        return await ApplicantModel.findById(session.userId);
    }
};

module.exports = AuthService;
