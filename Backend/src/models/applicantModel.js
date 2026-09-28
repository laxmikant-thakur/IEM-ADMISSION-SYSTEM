const { getPool } = require('../config/mysql');

/**
 * Applicant Model — MySQL queries for the applicants table
 */
const ApplicantModel = {
    /**
     * Create a new applicant
     */
    create: async ({ name, email, password, phone }) => {
        const pool = getPool();
        const [result] = await pool.query(
            'INSERT INTO applicants (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, password, phone]
        );
        return result.insertId;
    },

    /**
     * Find applicant by email
     */
    findByEmail: async (email) => {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM applicants WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    },

    /**
     * Find applicant by ID
     */
    findById: async (id) => {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT id, name, email, phone, created_at FROM applicants WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }
};

module.exports = ApplicantModel;
