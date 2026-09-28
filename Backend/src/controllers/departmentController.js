const DepartmentService = require('../services/departmentService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Department Controller — handles department and settings HTTP requests
 */
const DepartmentController = {
    /**
     * GET /api/admin/departments/seats
     */
    getSeats: async (req, res, next) => {
        try {
            const departments = await DepartmentService.getAllSeats();
            return sendSuccess(res, 200, 'Department seats retrieved', { departments });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/admin/departments/:id/seats
     */
    updateSeats: async (req, res, next) => {
        try {
            const departmentId = parseInt(req.params.id, 10);
            if (isNaN(departmentId)) {
                return sendError(res, 400, 'Invalid department ID');
            }

            const { totalSeats } = req.body;
            const result = await DepartmentService.updateDepartmentCapacity(departmentId, totalSeats);
            return sendSuccess(res, 200, 'Department capacity updated', { department: result });
        } catch (error) {
            if (error.statusCode) {
                return sendError(res, error.statusCode, error.message);
            }
            next(error);
        }
    },

    /**
     * GET /api/admin/settings/deadline
     */
    getDeadline: async (req, res, next) => {
        try {
            const deadline = await DepartmentService.getDeadline();
            return sendSuccess(res, 200, 'Deadline retrieved', deadline);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/admin/settings/deadline
     */
    updateDeadline: async (req, res, next) => {
        try {
            const { deadline } = req.body;
            const result = await DepartmentService.updateDeadline(deadline);
            return sendSuccess(res, 200, 'Deadline updated', result);
        } catch (error) {
            if (error.statusCode) {
                return sendError(res, error.statusCode, error.message);
            }
            next(error);
        }
    },

    /**
     * GET /api/departments (public — for application form dropdown)
     */
    getDepartmentList: async (req, res, next) => {
        try {
            const departments = await DepartmentService.getAllSeats();
            return sendSuccess(res, 200, 'Departments retrieved', { departments });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = DepartmentController;
