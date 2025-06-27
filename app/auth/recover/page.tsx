'use client';

import { useSearchParams } from 'next/navigation';

export default function RecoverPage() {
    const searchParams = useSearchParams();

    const ctx = searchParams.get('ctx');            // örnek: recover
    const source = searchParams.get('source');      // örnek: login
    const step = searchParams.get('step');          // örnek: 1

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-4">
            <h1 className="text-2xl font-bold mb-4">Hesap Kurtarma</h1>

            <p className="mb-2">
                <strong>Bağlam:</strong> {ctx}
            </p>

            <p className="mb-2">
                <strong>Kaynak:</strong> {source}
            </p>

            <p className="mb-4">
                <strong>Adım:</strong> {step}
            </p>

            {ctx === 'recover' && source === 'login' && (
                <p className="text-green-400">Login ekranından şifre kurtarma sürecindesiniz.</p>
            )}
        </div>
    );
}