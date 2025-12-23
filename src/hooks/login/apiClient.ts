import axios from 'axios';
import { getToken, removeToken } from '@/src/services/authService';

const apiClient = axios.create({
    baseURL: 'http://localhost:8081/api',
});

// Request interceptor - Her istekte token'ı header'a ekle
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - 401 durumunda token'ı sil
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeToken();
            // İsteğe bağlı: Login sayfasına yönlendir
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;