'use client';

import React from 'react';

interface ATMScreenProps {
    atmName: string;
    children?: React.ReactNode;
    showWelcome?: boolean;
}

export const ATMScreen: React.FC<ATMScreenProps> = ({
    atmName,
    children,
    showWelcome = true
}) => {
    return (
        <div className="relative w-full h-full bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg border-4 border-zinc-700 shadow-inner overflow-hidden">
            {/* Screen bezel effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* CRT scan line effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="w-full h-full" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)'
                }} />
            </div>

            {/* Header with ATM name */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gryffindor-burgundy via-gryffindor-maroon to-gryffindor-burgundy py-3 px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏧</span>
                        <span className="text-white font-bold text-lg">BAKIRBANK</span>
                    </div>
                    <span className="text-gryffindor-gold text-sm font-medium">{atmName}</span>
                </div>
            </div>

            {/* Main content area */}
            <div className="absolute top-16 bottom-0 left-0 right-0 p-6 overflow-auto">
                {children || (showWelcome && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-6xl mb-6 animate-float">🏦</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Hoş Geldiniz</h2>
                        <p className="text-zinc-400 text-lg mb-8">BAKIRBANK ATM Hizmetleri</p>

                        <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50 max-w-md">
                            <p className="text-gryffindor-gold text-sm font-medium mb-2">
                                💡 Bilgi
                            </p>
                            <p className="text-zinc-300 text-sm">
                                Kartsız para çekme işlemi için sağ taraftaki{' '}
                                <span className="text-gryffindor-gold font-semibold">"Kartsız İşlem"</span>{' '}
                                butonuna tıklayın.
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ATMScreen;
