import { create } from 'zustand';

type User = {
    id: string;
    name: string;
    email: string;
};

type AuthState = {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { username: string; email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
    logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (res.ok) {
                set({ user: data.user });
            } else {
                alert(data.message || 'Giriş başarısız');
            }
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (userData) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (res.ok) {
                set({ user: data.user });
            } else {
                alert(data.message || 'Kayıt başarısız');
            }
        } finally {
            set({ isLoading: false });
        }
    },

    logout: () => {
        set({ user: null });
    }
}));
