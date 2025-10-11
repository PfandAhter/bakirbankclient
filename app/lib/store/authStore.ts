import { create } from 'zustand';
import {login, register, logout, getCurrentUser, checkAuth} from '@/app/lib/api/services/authService';

interface User {
    id: string;
    email: string;
    firstName: string;
    secondName: string;
    lastName: string;
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
    getCurrentUser: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
            // Client-side'dan API route'una istek at
            const res = await fetch('/api/auth/sign-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Giriş başarısız');
            }

            const data = await res.json();

            set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

        } catch (error: any) {
            set({
                error: error.message || 'Giriş başarısız',
                isLoading: false,
                isAuthenticated: false,
                user: null
            });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });

        try {
            const res = await fetch('/api/auth/check');

            if (!res.ok) {
                throw new Error('Not authenticated');
            }

            const data = await res.json();

            set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        }
    },


    getCurrentUser: async () => {
        try {
            set({ isLoading: true });
            const user = await getCurrentUser();
            if (user) {
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (err) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: "Kullanıcı bilgisi alınamadı veya oturum süresi doldu",
            });
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


    clearError: () => {
        set({ error: null });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    }
}));