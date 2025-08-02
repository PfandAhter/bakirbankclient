import { useAuthStore } from '@/app/lib/store/authStore';

export const useAuth = () => {
    const {
        user,
        isLoading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
        clearError,
    } = useAuthStore();

    return {
        user,
        isLoading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
        clearError,
    };
};
