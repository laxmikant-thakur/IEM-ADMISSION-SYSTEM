const { getPool } = require('../config/mysql');

/**
 * Department Model — MySQL queries for the departments table
 */
const DepartmentModel = {
    /**
     * Get all departments with seat information
     */
    findAll: async () => {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT id, name, total_seats, available_seats FROM departments ORDER BY name'
        );
        return rows;
    },

    /**
     * Find department by ID
     */
    findById: async (id) => {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT id, name, total_seats, available_seats FROM departments WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Decrement available seats (with safety check)
     * Uses SELECT FOR UPDATE within a transaction for atomicity
     */
    decrementSeats: async (departmentId, connection) => {
        // Check current seats with row lock
        const [dept] = await connection.query(
            'SELECT available_seats FROM departments WHERE id = ? FOR UPDATE',
            [departmentId]
        );

        if (!dept[0] || dept[0].available_seats <= 0) {
            throw new Error('No seats available in this department');
        }

        // Decrement with safety WHERE clause
        const [result] = await connection.query(
            'UPDATE departments SET available_seats = available_seats - 1 WHERE id = ? AND available_seats > 0',
            [departmentId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Failed to update seat count');
        }

        return true;
    },

    /**
     * Check if department has available seats
     */
    hasAvailableSeats: async (departmentId) => {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT available_seats FROM departments WHERE id = ?',
            [departmentId]
        );
        return rows[0] && rows[0].available_seats > 0;
    },

    /**
     * Update department total_seats and recalculate available_seats
     * Formula: new_available = new_total - (old_total - old_available)
     * i.e., new_available = new_total - filled_seats
     */
    updateCapacity: async (departmentId, newTotalSeats) => {
        const pool = getPool();

        const dept = await DepartmentModel.findById(departmentId);
        if (!dept) {
            throw new Error('Department not found');
        }

        const filledSeats = dept.total_seats - dept.available_seats;
        const newAvailable = newTotalSeats - filledSeats;

        if (newAvailable < 0) {
            throw new Error(
                `Cannot set capacity to ${newTotalSeats}. ${filledSeats} seats are already filled.`
            );
        }

        const [result] = await pool.query(
            'UPDATE departments SET total_seats = ?, available_seats = ? WHERE id = ?',
            [newTotalSeats, newAvailable, departmentId]
        );

        return result.affectedRows > 0;
    }
};

module.exports = DepartmentModel;
