import { useAuthStore } from '@/app/lib/store/authStore';

export const useAuth = () => {
    const store = useAuthStore();

    return {
        user: store.user,
        isLoading: store.isLoading,
        error: store.error,
        isAuthenticated: store.isAuthenticated,
        login: store.login,
        register: store.register,
        logout: store.logout,
        checkAuth: store.checkAuth,
        clearError: store.clearError,
    };
};