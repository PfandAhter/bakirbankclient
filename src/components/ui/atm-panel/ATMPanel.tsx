'use client';

import React, { useState } from 'react';
import { Atm } from '@/src/types/atm-map';
import ATMButton from './ATMButton';
import ATMScreen from './ATMScreen';
import CardlessWithdrawModal from './CardlessWithdrawModal';

interface ATMPanelProps {
    atms: Atm[];
    loading?: boolean;
}

export const ATMPanel: React.FC<ATMPanelProps> = ({
    atms,
    loading = false
}) => {
    const [selectedAtm, setSelectedAtm] = useState<Atm | null>(atms[0] || null);
    const [isCardlessModalOpen, setIsCardlessModalOpen] = useState(false);

    // Sol taraftaki butonlar
    const leftButtons = [
        { id: 'withdraw', label: 'Para Çekme', icon: '💵', disabled: true },
        { id: 'deposit', label: 'Para Yatırma', icon: '💰', disabled: true },
        { id: 'balance', label: 'Bakiye Sorgulama', icon: '📊', disabled: true },
        { id: 'other', label: 'Diğer İşlemler', icon: '📋', disabled: true },
    ];

    // Sağ taraftaki butonlar
    const rightButtons = [
        { id: 'cardless', label: 'Kartsız İşlem', icon: '🔓', disabled: false, active: true },
        { id: 'bill', label: 'Fatura Ödeme', icon: '📄', disabled: true },
        { id: 'credit', label: 'Kredi Kartı', icon: '💳', disabled: true },
        { id: 'history', label: 'İşlemlerim', icon: '📜', disabled: true },
    ];

    const handleRightButtonClick = (buttonId: string) => {
        if (buttonId === 'cardless' && selectedAtm) {
            setIsCardlessModalOpen(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🏧</div>
                    <p className="text-zinc-400 text-lg">ATM yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-4 sm:p-8">
            {/* Page Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <span className="text-4xl">🏧</span>
                    BAKIRBANK ATM Simülatörü
                </h1>
                <p className="text-zinc-400">Kartsız para çekme hizmetini deneyimleyin</p>
            </div>

            {/* ATM Selector */}
            <div className="max-w-md mx-auto mb-8">
                <label className="block text-zinc-400 text-sm mb-2 text-center">
                    ATM Seçin
                </label>
                <div className="relative">
                    <select
                        value={selectedAtm?.id || ''}
                        onChange={(e) => {
                            const atm = atms.find(a => a.id === e.target.value);
                            setSelectedAtm(atm || null);
                        }}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-gryffindor-gold focus:ring-1 focus:ring-gryffindor-gold transition-all"
                    >
                        {atms.length === 0 ? (
                            <option value="">ATM bulunamadı</option>
                        ) : (
                            atms.map((atm) => (
                                <option key={atm.id} value={atm.id}>
                                    {atm.name} - {atm.address}
                                </option>
                            ))
                        )}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        ▼
                    </div>
                </div>
            </div>

            {/* ATM Machine */}
            <div className="max-w-5xl mx-auto">
                {/* ATM Body */}
                <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-3xl border-4 border-zinc-700 shadow-2xl overflow-hidden">
                    {/* ATM Top Section - Brand */}
                    <div className="bg-gradient-to-r from-gryffindor-wine via-gryffindor-burgundy to-gryffindor-wine py-4 px-6">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-3xl">🏦</span>
                            <span className="text-white font-bold text-2xl tracking-wider">BAKIRBANK</span>
                            <span className="text-gryffindor-gold text-sm font-medium">A.Ş.</span>
                        </div>
                    </div>

                    {/* ATM Main Section */}
                    <div className="p-6 sm:p-8">
                        <div className="flex items-stretch gap-4 sm:gap-6">
                            {/* Left Buttons */}
                            <div className="flex flex-col justify-center gap-3 w-32 sm:w-40">
                                {leftButtons.map((btn) => (
                                    <ATMButton
                                        key={btn.id}
                                        label={btn.label}
                                        icon={btn.icon}
                                        position="left"
                                        disabled={btn.disabled}
                                    />
                                ))}
                            </div>

                            {/* Screen */}
                            <div className="flex-1 min-h-[400px] sm:min-h-[450px]">
                                <ATMScreen atmName={selectedAtm?.name || 'ATM Seçiniz'} />
                            </div>

                            {/* Right Buttons */}
                            <div className="flex flex-col justify-center gap-3 w-32 sm:w-40">
                                {rightButtons.map((btn) => (
                                    <ATMButton
                                        key={btn.id}
                                        label={btn.label}
                                        icon={btn.icon}
                                        position="right"
                                        disabled={btn.disabled}
                                        active={btn.active}
                                        onClick={() => handleRightButtonClick(btn.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ATM Bottom Section - Card Slot & Keypad */}
                    <div className="bg-zinc-800/50 border-t border-zinc-700 px-6 sm:px-8 py-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            {/* Card Slot */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-48 h-3 bg-zinc-950 rounded-sm border border-zinc-600 shadow-inner" />
                                <span className="text-zinc-500 text-xs">Kart Yuvası (Dekoratif)</span>
                            </div>

                            {/* Receipt Slot */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-32 h-2 bg-zinc-950 rounded-sm border border-zinc-600 shadow-inner" />
                                <span className="text-zinc-500 text-xs">Makbuz Çıkışı</span>
                            </div>

                            {/* Cash Dispenser */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-40 h-6 bg-zinc-950 rounded border border-zinc-600 shadow-inner flex items-center justify-center">
                                    <span className="text-zinc-600 text-xs">💵💵💵</span>
                                </div>
                                <span className="text-zinc-500 text-xs">Para Çıkışı</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-gryffindor-burgundy/20 border border-gryffindor-burgundy/30 rounded-full px-6 py-2">
                        <span className="text-gryffindor-gold">💡</span>
                        <span className="text-zinc-300 text-sm">
                            Sağ taraftaki <span className="text-gryffindor-gold font-semibold">"Kartsız İşlem"</span> butonuna tıklayarak işleme başlayın
                        </span>
                    </div>
                </div>
            </div>

            {/* Cardless Withdraw Modal */}
            {selectedAtm && (
                <CardlessWithdrawModal
                    isOpen={isCardlessModalOpen}
                    onClose={() => setIsCardlessModalOpen(false)}
                    atmId={selectedAtm.id}
                    atmName={selectedAtm.name}
                />
            )}
        </div>
    );
};

export default ATMPanel;
