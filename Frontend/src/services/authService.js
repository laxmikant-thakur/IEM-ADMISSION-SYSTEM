import api from './api';

const authService = {
    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (data) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    adminLogin: async (data) => {
        const response = await api.post('/admin/login', data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    adminLogout: async () => {
        const response = await api.post('/admin/logout');
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    getAdminMe: async () => {
        const response = await api.get('/admin/me');
        return response.data;
    }
};

export default authService;
