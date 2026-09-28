import api from './api';

const applicationService = {
    submitApplication: async (formData) => {
        // formData should be a FormData object (multipart)
        const response = await api.post('/applications', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getMyApplication: async () => {
        const response = await api.get('/applications/me');
        return response.data;
    },

    getMyStatus: async () => {
        const response = await api.get('/applications/status');
        return response.data;
    },

    getDepartments: async () => {
        const response = await api.get('/departments');
        return response.data;
    }
};

export default applicationService;
