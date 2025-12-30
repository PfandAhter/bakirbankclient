import axios from 'axios';
// getToken ve removeToken client-side'da (HttpOnly cookie) kullanılamaz.
// import { getToken, removeToken } from '@/src/services/authService';

const apiClient = axios.create({
    baseURL: 'http://localhost:8081/api',
    withCredentials: true, // HttpOnly cookie'lerin gönderilmesi için gerekli
});

// Request interceptor - Token header'a eklenemez çünkü HttpOnly.
// Browser otomatik gönderir if withCredentials=true ve same-site/CORS ayarları doğruysa.
/*apiClient.interceptors.request.use(
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
);*/

// Response interceptor - 401 durumunda login'e yönlendir
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // removeToken(); // Client side cannot remove HttpOnly cookie directly
            // İsteğe bağlı: Login sayfasına yönlendir
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;