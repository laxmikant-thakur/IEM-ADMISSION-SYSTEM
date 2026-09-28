const { getPool } = require('../config/mysql');

/**
 * Admin Model — MySQL queries for the admins table
 */
const AdminModel = {
    /**
     * Find admin by email
     */
    findByEmail: async (email) => {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM admins WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    },

    /**
     * Find admin by ID (excluding password)
     */
    findById: async (id) => {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT id, name, email, created_at FROM admins WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }
};

module.exports = AdminModel;
