'use client';

import React, {useEffect} from 'react';
import { useAuthStore } from '@/src/hooks/login/authStore';
import { RefreshCw } from 'lucide-react';
import {useNotificationStore} from "@/src/hooks/notification/notificationStore";
import {usePathname} from "next/navigation";

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const {isLoading,getCurrentUser,setLoading} = useAuthStore();
    const { showNotification } = useNotificationStore();
    const pathname = usePathname();

    const isPublicPage = (
        pathname === '/sign-in' ||
        pathname === '/sign-up' ||
        pathname === '/authentication/forgot-password'
    );

    useEffect(() => {
        console.log('AuthProvider: Starting auth check...');
        console.log('isLoading: ', isLoading);
        const initAuth = async () => {
            try {
                if (isPublicPage){
                    setLoading(false);
                    return;
                }
                await getCurrentUser();
                showNotification("Authentication completed","success");
            } catch (error) {
                showNotification("Authentication failed","error");
                console.error('AuthProvider: Auth check failed:', error);
            }
        };

        initAuth();
    }, [pathname]);

    if (isLoading && !isPublicPage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">Uygulama yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
};
