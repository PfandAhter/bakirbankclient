import { create } from 'zustand';
import {login, register, logout, getCurrentUser, getToken} from '@/app/lib/api/services/authService';

interface User {
    id: string;
    name: string;
    email: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await login(email, password);
            set({
                user: data.user,
                isLoading: false,
                isAuthenticated: true,
                error: null
            });
        } catch (error: unknown) {
            console.log('Login error:', error);
            debugger;
            const err = error as { message?: string, status?: number };
            console.log('error codetest', err.status);
            set({
                error: err.message || 'Giriş başarısız',
                isLoading: false,
                isAuthenticated: false,
                user: null
            });
            throw error;
        }
    },

    register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
            await register(userData);
            set({ isLoading: false, error: null });
        } catch (error: unknown) {
            const err = error as { message?: string };
            set({
                error: err.message || 'Kayıt başarısız',
                isLoading: false
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true });

            // API logout çağrısı
            await logout();

            // State'i tamamen temizle
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });

            // Sayfa yenile - bu sayede tüm component'ler temizlenir
            window.location.href = '/';

        } catch (error) {
            console.error('Logout error:', error);

            // Hata olsa bile state'i temizle
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });

            // Sayfa yenile
            window.location.href = '/';
        }
    },

    checkAuth: async () => {
        try {
            set({ isLoading: true, error: null });

            // İlk olarak token kontrolü yap
            const token = getToken();

            if (!token) {
                // Token yoksa authenticated değil
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null
                });
                return;
            }

            // Token varsa user bilgilerini al
            //const user = await getCurrentUser();

            set({
                //user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

        } catch (error: any) {
            console.log('Auth check failed:', error.message);

            // Auth check başarısız - state temizle
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        }
    },

    clearError: () => {
        set({ error: null });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    }
}));