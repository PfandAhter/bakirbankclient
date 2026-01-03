'use client';

import React, { useState, useMemo } from 'react';
import { useATMWithdraw } from '@/src/hooks/atm/useATMWithdraw';

interface CardlessWithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    atmId: string;
    atmName: string;
}

type InputType = 'tckn' | 'iban' | 'unknown';

export const CardlessWithdrawModal: React.FC<CardlessWithdrawModalProps> = ({
    isOpen,
    onClose,
    atmId,
    atmName
}) => {
    const [inputValue, setInputValue] = useState('');
    const { withdrawFromATM, loading, error, success, response, reset } = useATMWithdraw();

    // Otomatik olarak input tipini algıla
    const detectedType: InputType = useMemo(() => {
        if (inputValue.length === 0) return 'unknown';

        // TR ile başlıyorsa IBAN
        if (inputValue.toUpperCase().startsWith('TR')) {
            return 'iban';
        }

        // Rakam ile başlıyorsa TCKN
        if (/^\d/.test(inputValue)) {
            return 'tckn';
        }

        return 'unknown';
    }, [inputValue]);

    // Maksimum uzunluk
    const maxLength = useMemo(() => {
        if (detectedType === 'iban') return 26;
        if (detectedType === 'tckn') return 11;
        return 26; // varsayılan
    }, [detectedType]);

    // Input geçerli mi?
    const isValid = useMemo(() => {
        if (detectedType === 'tckn') {
            return inputValue.length === 11 && /^\d{11}$/.test(inputValue);
        }
        if (detectedType === 'iban') {
            return inputValue.length === 26 && /^TR\d{24}$/.test(inputValue.toUpperCase());
        }
        return false;
    }, [inputValue, detectedType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase();

        // TR ile başlıyorsa IBAN formatı uygula
        if (value.startsWith('TR')) {
            // TR + sadece rakamlar
            value = 'TR' + value.slice(2).replace(/[^0-9]/g, '');
            if (value.length <= 26) {
                setInputValue(value);
            }
        }
        // Rakam ile başlıyorsa TCKN formatı uygula
        else if (/^\d/.test(value)) {
            value = value.replace(/\D/g, '');
            if (value.length <= 11) {
                setInputValue(value);
            }
        }
        // Henüz belirlenemedi - sadece T veya TR girilmiş olabilir
        else if (value === 'T' || value === '') {
            setInputValue(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) return;

        await withdrawFromATM({
            atmId,
            iban: detectedType === 'iban' ? inputValue.toUpperCase() : undefined,
            tckn: detectedType === 'tckn' ? inputValue : undefined
        });
    };

    const handleClose = () => {
        reset();
        setInputValue('');
        onClose();
    };

    const handleNewTransaction = () => {
        reset();
        setInputValue('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-700/50 shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-gryffindor-burgundy to-gryffindor-maroon px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💳</span>
                            <div>
                                <h2 className="text-white font-bold text-lg">Kartsız Para Çekme</h2>
                                <p className="text-gryffindor-gold text-sm">{atmName}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white/70 hover:text-white transition-colors text-2xl font-light"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        /* Success State */
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4 animate-bounce">✅</div>
                            <h3 className="text-2xl font-bold text-green-400 mb-2">
                                İşlem Başarılı!
                            </h3>
                            <p className="text-zinc-400 mb-6">
                                {response?.processMessage || 'Paranız hazırlanıyor...'}
                            </p>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-center gap-2 text-green-400">
                                    <span className="text-2xl">💵</span>
                                    <span className="text-lg font-medium">Lütfen paranızı alınız</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleNewTransaction}
                                    className="flex-1 py-3 px-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                                >
                                    Yeni İşlem
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-gryffindor-burgundy to-gryffindor-maroon hover:from-gryffindor-maroon hover:to-gryffindor-burgundy text-white rounded-lg transition-all"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Form State */
                        <form onSubmit={handleSubmit}>
                            {/* Smart Input Field */}
                            <div className="mb-6">
                                <label className="block text-zinc-400 text-sm mb-2">
                                    TCKN veya IBAN
                                </label>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="TCKN (11 hane) veya IBAN (TR ile başlayan)"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-gryffindor-gold focus:ring-1 focus:ring-gryffindor-gold transition-all text-lg tracking-wider font-mono"
                                    maxLength={maxLength}
                                    autoFocus
                                />

                                {/* Status indicator */}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        {detectedType === 'tckn' && (
                                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full flex items-center gap-1">
                                                🪪 TCKN
                                            </span>
                                        )}
                                        {detectedType === 'iban' && (
                                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                                                🏦 IBAN
                                            </span>
                                        )}
                                        {detectedType === 'unknown' && inputValue.length > 0 && (
                                            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                                                ⚠️ Geçersiz format
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-zinc-500 text-xs">
                                        {inputValue.length}/{maxLength} karakter
                                    </span>
                                </div>

                                {/* Helper text */}
                                <p className="text-zinc-500 text-xs mt-3">
                                    💡 <span className="text-zinc-400">Rakam ile başlarsanız</span> TCKN,
                                    <span className="text-zinc-400"> TR ile başlarsanız</span> IBAN olarak algılanır.
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm flex items-center gap-2">
                                        <span>⚠️</span>
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !isValid}
                                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${loading || !isValid
                                        ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-gryffindor-burgundy to-gryffindor-maroon hover:from-gryffindor-maroon hover:to-gryffindor-burgundy text-white shadow-lg shadow-gryffindor-burgundy/30'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        İşleniyor...
                                    </span>
                                ) : (
                                    '💵 Para Çek'
                                )}
                            </button>

                            {/* Info */}
                            <p className="text-zinc-500 text-xs text-center mt-4">
                                Bu işlem simülasyon amaçlıdır.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardlessWithdrawModal;
