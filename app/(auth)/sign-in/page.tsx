'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/app/components/forms/auth/LoginForm';

export default function SignInPage() {
    const router = useRouter();

    return (
        <LoginForm onSwitchToRegister={() => router.push('/sign-up')} />
    );
}