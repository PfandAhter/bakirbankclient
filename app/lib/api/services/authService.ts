"use server";

import axios from 'axios';
import {
    getAccessTokenFromSession,
    createUserSessionToken, deleteUserSessionToken
} from '@/app/lib/store/cookieUtils';

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    gsm: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    secondName: string;
    lastName: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';


/*export const getToken = (): string | null => {
    const cookieStore = cookies();
    getAccessTokenFromSession();
    return cookieStore.get(TOKEN_COOKIE_NAME)?.value || null;
};

export const setToken = (token: string): void => {
    setCookie(TOKEN_COOKIE_NAME, token, 1); // 1 gün
};

export const removeToken = (): void => {
    deleteCookie(TOKEN_COOKIE_NAME);
};*/

export async function getAuthHeaders() {
    const token = await getAccessTokenFromSession();
    return {
        'Content-Type': 'application/json',
        ...(token && {'Authorization': `Bearer ${token}`})
    };
};

export async function login(email: string, password: string) {
    try {
        const response = await axios.post(`${API_BASE_URL}/authentication/login`,
            { email, password },
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
                validateStatus: () => true
            }
        );
        const data = response.data;
        console.log("Login response data:", data.processMessage);
        console.log("response status:", response.status);

        if (response.status !== 200) {
            throw new Error(data.processMessage || "Giriş başarısız");
        }

        await createUserSessionToken(data.token);

        return data.processMessage;
    } catch (error: any) {
        console.log("Login error caught:", error.message);
        if (error.response) {
            throw new Error(error.message || "Giriş başarısız");
        } else {
            throw new Error(error.message);
        }
    }
}

export async function register(userData: RegisterData) {
    try{
        console.log("Registering user with data:", userData);
        const response = await axios.post(`${API_BASE_URL}/authentication/register`,
            userData,
            {
                headers: {'Content-Type': 'application/json'},
                withCredentials: true,
                validateStatus: () => true
            }
        );
        console.log("REGISTER RESPONSE DATA VSVSVS : ",response);
        const data = response.data;
        console.log("Register response data:", data.processMessage);
        console.log("response status:", response.status);

        if(response.status !== 200){
            throw new Error(data.processMessage || "Kayıt başarısız");
        }

        return data.processMessage;
    }catch(error: any){
        console.log("Register error caught:", error);
        if (error.response) {
            throw new Error(error.message || "Kayıt başarısız");
        } else {
            throw new Error(error.message);
        }
    }
}

export async function logout() {
    const headers = await getAuthHeaders();
    try {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {headers});
    } catch (err) {
        console.error("Logout API error:", err);
    }
    await deleteUserSessionToken();
}


export async function checkAuth() {
    try {
        const headers = await getAuthHeaders();
        const res = await axios.get(`${API_BASE_URL}/account/user/check/auth`, {headers});
        return res.data.authenticated === true;
    } catch {
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const headers = await getAuthHeaders();
        const res = await axios.post(`${API_BASE_URL}/account/api/v1/user/get/info`, {},{ headers, withCredentials: true });
        return res.data.user;
    } catch (err: any) {
        if (err.response?.status === 401) {
            await deleteUserSessionToken();
        }
        console.log("Get current user error caught:", err.message);
                throw new Error(err.response?.data?.message || "Kullanıcı bilgileri alınamadı");
    }
}

//TODO: Burada hata yonetimini daha iyi yapabiliriz.


/*export const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/authentication/login`, {
            email,
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

export const checkAuth = async (): Promise<boolean> => {
    try{
        const response = await axios.get(`${API_BASE_URL}/account/user/check/auth`, {
            headers:getAuthHeaders()
        });

        return response.data.authenticated === true;
    }catch (error){
        return false;
    }
}

// Mevcut kullanıcıyı al (token doğrulama)
export const getCurrentUser = async (): Promise<User> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/account/user/get/info`, { //TODO: Kullanici bilgilerini buraddan alacaz..
            headers:getAuthHeaders()
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
};*/