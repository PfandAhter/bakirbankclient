'use client';

import { useRouter } from 'next/navigation';
import RegisterForm from '@/app/components/forms/auth/RegisterForm';

export default function SignUpPage() {
    const router = useRouter();

    return (
        <RegisterForm onSwitchToLogin={() => router.push('/sign-in')} />
    );
}