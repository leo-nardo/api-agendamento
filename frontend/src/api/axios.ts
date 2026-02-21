import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const companyId = localStorage.getItem('companyId');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (companyId) {
            config.headers['X-Company-Id'] = companyId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

import { toast } from 'sonner';

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            toast.error("Você não tem autorização ou sua sessão expirou.");
            if (!window.location.pathname.includes('/admin/login') && !window.location.pathname.startsWith('/admin')) {
                // Public page, do nothing or redirect to public
            } else if (window.location.pathname !== '/admin/login') {
                // If it's a backend 401 bug, it shouldn't clear the token and force login.
                // It should just redirect to dashboard or show an error.
                // However, if the token is really invalid, jwt-decode in AuthContext will log them out anyway.
                // So we'll just redirect to the dashboard for now to avoid the login loop on backend errors.
                window.location.href = '/admin';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
