'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useATM } from '@/src/hooks/useAtm';
import ATMPanel from '@/src/components/ui/atm-panel/ATMPanel';

export default function ATMPanelPage() {
    const router = useRouter();
    const { atms, loading, error, refetch } = useATM();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🏧</div>
                    <p className="text-zinc-400 text-lg">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Bağlantı Hatası</h2>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-6 py-3 bg-gradient-to-r from-gryffindor-burgundy to-gryffindor-maroon hover:from-gryffindor-maroon hover:to-gryffindor-burgundy text-white rounded-lg font-medium transition-all"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 rounded-lg text-white transition-all group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="text-sm">Ana Sayfa</span>
                </button>
            </div>

            {/* ATM Panel */}
            <ATMPanel atms={atms} loading={loading} />
        </div>
    );
}
