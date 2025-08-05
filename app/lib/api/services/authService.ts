import axios from 'axios';
import { setCookie, getCookie, deleteCookie } from '@/app/lib/store/cookieUtils';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

const TOKEN_COOKIE_NAME = 'access_token';

// Environment variable'dan base URL'i al
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

export const getToken = (): string | null => {
    return getCookie(TOKEN_COOKIE_NAME);
};

export const setToken = (token: string): void => {
    setCookie(TOKEN_COOKIE_NAME, token, 1); // 1 gün
};

export const removeToken = (): void => {
    deleteCookie(TOKEN_COOKIE_NAME);
};

export const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Login fonksiyonu - Axios ile
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            username,
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        // Token'ı cookie'ye kaydet
        if (data.token) {
            setToken(data.token);
        }

        return data;
    } catch (error: any) {
        let errorMessage = "Giriş başarısız, lütfen tekrar deneyin";

        if(error.status === 403){
            errorMessage = "Kullanıcı adı veya şifre yanlış";
        }
        throw new Error(errorMessage);
    }
};

// Register fonksiyonu - Axios ile
export const register = async (userData: RegisterData): Promise<void> => {
    try {
        await axios.post(`${API_BASE_URL}/auth/register`, userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        //TODO Burada hata mesajını daha ayrıntılı yapabilirsin Ingilizce donen kodu turkceye cevirebiliriz.
        const errorMessage = error.response?.data?.message || error.message || 'Kayıt başarısız';
        throw new Error(errorMessage);
    }
};

// Logout fonksiyonu
export const logout = async (): Promise<void> => {
    const token = getToken();

    if (token) {
        try {
            await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error('Logout API error:', error);
            // API hatası olsa bile token'ı sil
        }
    }

    // Token'ı her durumda sil
    removeToken();
};

// Mevcut kullanıcıyı al (token doğrulama)
export const getCurrentUser = async (): Promise<User> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: getAuthHeaders()
        });

        return response.data.user;
    } catch (error: any) {
        // Eğer token geçersizse sil
        if (error.response?.status === 401) {
            removeToken();
        }

        const errorMessage = error.response?.data?.message || error.message || 'Kullanıcı bilgileri alınamadı';
        throw new Error(errorMessage);
    }
};

// Alternatif: Global axios instance (opsiyonel)
export const createAuthApiClient = () => {
    const apiClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Request interceptor - Her istekte token'ı ekle
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
                // window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return apiClient;
};