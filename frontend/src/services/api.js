import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to add the JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor to handle 401 Unauthorized and 422 (invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        // 401 = unauthorized, 422 = invalid/expired JWT token (Flask-JWT-Extended)
        if ((status === 401 || status === 422) && window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
