const { getPool } = require('../config/mysql');

/**
 * Application Model — MySQL queries for the applications table
 */
const ApplicationModel = {
    /**
     * Create a new application
     */
    create: async (applicationData) => {
        const pool = getPool();
        const {
            applicant_id, department_id,
            date_of_birth, gender, blood_group, nationality, category, aadhaar_number,
            guardian_name,
            address_line1, address_line2, city, state, pincode,
            tenth_board, tenth_year, tenth_percentage,
            twelfth_board, twelfth_year, twelfth_percentage
        } = applicationData;

        const [result] = await pool.query(
            `INSERT INTO applications (
                applicant_id, department_id,
                date_of_birth, gender, blood_group, nationality, category, aadhaar_number,
                guardian_name,
                address_line1, address_line2, city, state, pincode,
                tenth_board, tenth_year, tenth_percentage,
                twelfth_board, twelfth_year, twelfth_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                applicant_id, department_id,
                date_of_birth, gender, blood_group || null, nationality, category, aadhaar_number,
                guardian_name,
                address_line1, address_line2 || null, city, state, pincode,
                tenth_board, tenth_year, tenth_percentage,
                twelfth_board, twelfth_year, twelfth_percentage
            ]
        );
        return result.insertId;
    },

    /**
     * Find application by applicant ID
     */
    findByApplicantId: async (applicantId) => {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT a.*, d.name as department_name
             FROM applications a
             JOIN departments d ON a.department_id = d.id
             WHERE a.applicant_id = ?`,
            [applicantId]
        );
        return rows[0] || null;
    },

    /**
     * Find application by ID
     */
    findById: async (id) => {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT a.*, d.name as department_name,
                    ap.name as applicant_name, ap.email as applicant_email, ap.phone as applicant_phone
             FROM applications a
             JOIN departments d ON a.department_id = d.id
             JOIN applicants ap ON a.applicant_id = ap.id
             WHERE a.id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Get all applications (for admin) with optional status + department filters
     */
    findAll: async (filters = {}) => {
        const pool = getPool();
        let query = `
            SELECT a.id, a.applicant_id, a.department_id, a.status, a.submitted_at, a.updated_at,
                   a.rejection_reason,
                   d.name as department_name,
                   ap.name as applicant_name, ap.email as applicant_email
            FROM applications a
            JOIN departments d ON a.department_id = d.id
            JOIN applicants ap ON a.applicant_id = ap.id
        `;
        const conditions = [];
        const params = [];

        if (filters.status) {
            conditions.push('a.status = ?');
            params.push(filters.status);
        }

        if (filters.department_id) {
            conditions.push('a.department_id = ?');
            params.push(filters.department_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.submitted_at DESC';

        const [rows] = await pool.query(query, params);
        return rows;
    },

    /**
     * Get students with filters (status, department) — includes full academic data
     */
    findStudents: async (filters = {}) => {
        const pool = getPool();
        let query = `
            SELECT a.id, a.applicant_id, a.department_id, a.status,
                   a.submitted_at, a.updated_at, a.rejection_reason,
                   a.tenth_percentage, a.twelfth_percentage,
                   d.name as department_name,
                   ap.name as applicant_name, ap.email as applicant_email, ap.phone as applicant_phone
            FROM applications a
            JOIN departments d ON a.department_id = d.id
            JOIN applicants ap ON a.applicant_id = ap.id
        `;
        const conditions = [];
        const params = [];

        if (filters.status) {
            // 'awaiting' maps to both Submitted and Under Review
            if (filters.status === 'awaiting') {
                conditions.push("(a.status = 'Submitted' OR a.status = 'Under Review')");
            } else {
                conditions.push('a.status = ?');
                params.push(filters.status);
            }
        }

        if (filters.department_id) {
            conditions.push('a.department_id = ?');
            params.push(filters.department_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.submitted_at DESC';

        const [rows] = await pool.query(query, params);
        return rows;
    },

    /**
     * Get dashboard statistics (counts by status)
     */
    getDashboardStats: async () => {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('Submitted', 'Under Review') THEN 1 ELSE 0 END) as awaiting,
                SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
            FROM applications
        `);
        return rows[0];
    },

    /**
     * Update application status
     */
    updateStatus: async (id, status, rejectionReason = null) => {
        const pool = getPool();
        const [result] = await pool.query(
            'UPDATE applications SET status = ?, rejection_reason = ? WHERE id = ?',
            [status, rejectionReason, id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Get application status by applicant ID
     */
    getStatusByApplicantId: async (applicantId) => {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT a.id, a.status, a.rejection_reason, a.submitted_at, a.updated_at,
                    d.name as department_name
             FROM applications a
             JOIN departments d ON a.department_id = d.id
             WHERE a.applicant_id = ?`,
            [applicantId]
        );
        return rows[0] || null;
    }
};

module.exports = ApplicationModel;
