import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const fetchMessages = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.source) params.append('source', filters.source);
        if (filters.project) params.append('project', filters.project);

        const response = await api.get(`/api/messages?${params.toString()}`);
        return response;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
};

export const fetchTemplates = async () => {
    try {
        const response = await api.get('/api/templates');
        return response;
    } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
    }
};

export const fetchStats = async () => {
    try {
        const response = await api.get('/api/stats');
        return response;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return {
            total_messages: 0,
            telegram_messages: 0,
            twitter_messages: 0,
            categories: {
                urgent: 0,
                high_priority: 0,
                routine: 0,
                archive: 0
            }
        };
    }
};

export const fetchAnalytics = async () => {
    try {
        const response = await api.get('/api/analytics');
        return response;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return {
            overview: {
                total_messages: 0,
                telegram_messages: 0,
                twitter_messages: 0,
                recent_messages_24h: 0
            },
            categories: {
                urgent: 0,
                high_priority: 0,
                routine: 0,
                archive: 0
            },
            project_mentions: {},
            audited_projects: {}
        };
    }
};

export const fetchProjects = async () => {
    try {
        const response = await api.get('/api/projects');
        return response;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return { projects: {} };
    }
};

export const refreshMessages = async () => {
    try {
        const response = await api.post('/api/refresh');
        return response;
    } catch (error) {
        console.error('Error refreshing messages:', error);
        throw error;
    }
};

export const updateMessageCategory = async (messageId, category) => {
    try {
        const response = await api.post(`/api/messages/${messageId}/category`, {
            category: category
        });
        return response;
    } catch (error) {
        console.error('Error updating message category:', error);
        throw error;
    }
};

export default api;
