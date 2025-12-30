'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useAuth } from '@/src/hooks/login/useAuth';
import RegisterForm from '@/src/components/ui/register/RegisterForm';

function SignUpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const redirectUrl = searchParams.get('redirect') || '/';

    useEffect(() => {
        if (user) {
            router.push(decodeURIComponent(redirectUrl));
        }
    }, [user, router, redirectUrl]);

    const handleSwitchToLogin = () => {
        const redirectParam = searchParams.get('redirect');
        const loginUrl = redirectParam
            ? `/sign-in?redirect=${redirectParam}`
            : '/sign-in';
        router.push(loginUrl);
    };

    const handleSuccessfulRegister = () => {
        router.push(decodeURIComponent(redirectUrl));
    };

    if (user) {
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
            {/*redirectUrl !== '/' && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-4 mx-4 max-w-md mx-auto mt-4">
                    <p className="text-green-300 text-sm text-center">
                        Kayıt olduktan sonra <span className="font-semibold">{decodeURIComponent(redirectUrl)}</span> sayfasına yönlendirileceksiniz
                    </p>
                </div>
            )*/}

            <RegisterForm
                onSwitchToLogin={handleSwitchToLogin}
                onSuccessfulRegister={handleSuccessfulRegister}
            />
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}