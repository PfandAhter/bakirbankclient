'use client';

import { useAuth } from '@/app/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            const redirectUrl = `/sign-in?redirect=${encodeURIComponent(pathname)}`;
            router.replace(redirectUrl);
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-white">Doğrulama yapılıyor...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-white">Yönlendiriliyor...</div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;