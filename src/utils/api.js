import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api', // Pointing to our Express backend
});

// Add a request interceptor to inject the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
