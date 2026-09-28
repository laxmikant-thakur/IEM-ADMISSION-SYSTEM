import api from './api';

const adminService = {
    // Applications
    getApplications: async (filters = {}) => {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.department_id) params.department_id = filters.department_id;
        const response = await api.get('/admin/applications', { params });
        return response.data;
    },

    getApplicationDetails: async (id) => {
        const response = await api.get(`/admin/applications/${id}`);
        return response.data;
    },

    getApplicationDocuments: async (id) => {
        const response = await api.get(`/admin/applications/${id}/documents`);
        return response.data;
    },

    acceptApplication: async (id) => {
        const response = await api.patch(`/admin/applications/${id}/accept`);
        return response.data;
    },

    rejectApplication: async (id, rejectionReason) => {
        const response = await api.patch(`/admin/applications/${id}/reject`, { rejectionReason });
        return response.data;
    },

    // Students
    getStudents: async (filters = {}) => {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.department_id) params.department_id = filters.department_id;
        const response = await api.get('/admin/students', { params });
        return response.data;
    },

    // Dashboard
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard-stats');
        return response.data;
    },

    // Department seats
    getDepartmentSeats: async () => {
        const response = await api.get('/admin/departments/seats');
        return response.data;
    },

    updateDepartmentSeats: async (departmentId, totalSeats) => {
        const response = await api.patch(`/admin/departments/${departmentId}/seats`, { totalSeats });
        return response.data;
    },

    // Settings
    getDeadline: async () => {
        const response = await api.get('/admin/settings/deadline');
        return response.data;
    },

    updateDeadline: async (deadline) => {
        const response = await api.patch('/admin/settings/deadline', { deadline });
        return response.data;
    },

    // Document download URL
    getDocumentUrl: (documentId) => {
        return `http://localhost:5000/api/admin/documents/${documentId}/download`;
    }
};

export default adminService;
