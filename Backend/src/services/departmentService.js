const DepartmentModel = require('../models/departmentModel');
const { getDeadline, updateDeadline } = require('../utils/deadline');

/**
 * Department Service — handles department and settings business logic
 */
const DepartmentService = {
    /**
     * Get all departments with seat information
     */
    getAllSeats: async () => {
        const departments = await DepartmentModel.findAll();
        return departments.map(dept => ({
            id: dept.id,
            name: dept.name,
            totalSeats: dept.total_seats,
            availableSeats: dept.available_seats,
            filledSeats: dept.total_seats - dept.available_seats
        }));
    },

    /**
     * Update department capacity (admin action)
     */
    updateDepartmentCapacity: async (departmentId, newTotalSeats) => {
        if (!newTotalSeats || isNaN(newTotalSeats) || newTotalSeats < 1) {
            const error = new Error('Total seats must be a positive number');
            error.statusCode = 400;
            throw error;
        }

        const dept = await DepartmentModel.findById(departmentId);
        if (!dept) {
            const error = new Error('Department not found');
            error.statusCode = 404;
            throw error;
        }

        try {
            await DepartmentModel.updateCapacity(departmentId, parseInt(newTotalSeats, 10));
        } catch (err) {
            const error = new Error(err.message);
            error.statusCode = 400;
            throw error;
        }

        const updated = await DepartmentModel.findById(departmentId);
        return {
            id: updated.id,
            name: updated.name,
            totalSeats: updated.total_seats,
            availableSeats: updated.available_seats,
            filledSeats: updated.total_seats - updated.available_seats
        };
    },

    /**
     * Get current application deadline
     */
    getDeadline: async () => {
        const deadline = await getDeadline();
        return {
            deadline: deadline.toISOString(),
            isPassed: new Date() > deadline
        };
    },

    /**
     * Update application deadline (admin action)
     */
    updateDeadline: async (newDeadline) => {
        if (!newDeadline) {
            const error = new Error('Deadline date is required');
            error.statusCode = 400;
            throw error;
        }

        const deadlineDate = new Date(newDeadline);
        if (isNaN(deadlineDate.getTime())) {
            const error = new Error('Invalid deadline date format');
            error.statusCode = 400;
            throw error;
        }

        await updateDeadline(deadlineDate.toISOString());
        return {
            deadline: deadlineDate.toISOString(),
            isPassed: new Date() > deadlineDate
        };
    }
};

module.exports = DepartmentService;
