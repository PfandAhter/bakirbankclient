import { create } from 'zustand';
import { login, register, logout, getCurrentUser } from '@/app/lib/api/services/authService';

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
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: false,
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
            const err = error as { message?: string };
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
        set({ isLoading: true });
        try {
            await logout();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        } catch (error) {
            // Logout hatası olsa bile state'i temizle
            console.error('Logout error:', error);
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const user = await getCurrentUser();
            set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });
        } catch (error) {
            console.error('Check auth error:', error);
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        }
    },

    clearError: () => set({ error: null }),
}));