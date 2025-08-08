'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import LoginForm from '@/app/components/forms/auth/LoginForm';

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated } = useAuth();

    const redirectUrl = searchParams.get('redirect') || '/';

    useEffect(() => {
        // Kullanıcı zaten giriş yapmışsa yönlendirme yap
        if (isAuthenticated) {
            console.log('Kullanıcı zaten giriş yapmış, yönlendiriliyor... ve redirectUrl:', redirectUrl);
            router.push(decodeURIComponent(redirectUrl));
        }
    }, [user, router, redirectUrl]);

    const handleSwitchToRegister = () => {
        // Redirect URL'i register sayfasına da aktar
        const redirectParam = searchParams.get('redirect');
        const registerUrl = redirectParam
            ? `/sign-up?redirect=${redirectParam}`
            : '/sign-up';
        router.push(registerUrl);
    };

    const handleSuccessfulLogin = () => {
        // Login başarılı olduktan sonra redirect URL'e git
        router.push(decodeURIComponent(redirectUrl));
    };

    // Kullanıcı zaten giriş yapmışsa loading göster
    if (isAuthenticated) {
        console.log('Kullanici giris yapmis mi ?', isAuthenticated);
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Yönlendiriliyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <LoginForm
                onSwitchToRegister={handleSwitchToRegister}
                onSuccessfulLogin={handleSuccessfulLogin}
            />
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}