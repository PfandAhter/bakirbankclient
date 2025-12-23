// src/components/ui/confirmation/TransactionConfirmationModal.tsx
'use client';

import React, { useState } from 'react';
import { useConfirmation, AdditionalApproveStatus } from '@/src/providers/ConfirmationProvider';

export function TransactionConfirmationModal() {
    const { pendingConfirmation, handleResponse, clearConfirmation, isProcessing } = useConfirmation();
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);

    if (!pendingConfirmation) return null;

    const onAction = async (status: AdditionalApproveStatus) => {
        if (status === 'BLOCK_ACCOUNT') {
            setShowBlockConfirm(true);
            return;
        }
        await handleResponse(status);
    };

    const confirmBlock = async () => {
        setShowBlockConfirm(false);
        await handleResponse('BLOCK_ACCOUNT');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md mx-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-xl">
                            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {pendingConfirmation.title}
                            </h2>
                            <p className="text-xs text-slate-400">
                                İşlem onayı gerekiyor
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {pendingConfirmation.message}
                    </p>

                    <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{new Date(pendingConfirmation.timestamp).toLocaleString('tr-TR')}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {!showBlockConfirm ? (
                    <div className="px-6 py-4 bg-slate-800/50 border-t border-white/5 space-y-3">
                        <div className="flex gap-3">
                            <button
                                onClick={() => onAction('APPROVED')}
                                disabled={isProcessing}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                Onayla
                            </button>

                            <button
                                onClick={() => onAction('REJECTED')}
                                disabled={isProcessing}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reddet
                            </button>
                        </div>

                        <button
                            onClick={() => onAction('BLOCK_ACCOUNT')}
                            disabled={isProcessing}
                            className="w-full py-3 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium rounded-xl border border-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-red-400">Bu benim işlemim değil - Hesabımı kilitle</span>
                        </button>
                    </div>
                ) : (
                    <div className="px-6 py-4 bg-red-900/20 border-t border-red-500/20">
                        <div className="flex items-center gap-3 mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                            <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm text-red-300">
                                <strong>Dikkat!</strong> Hesabınız bloke edilecek ve tüm işlemler durdurulacaktır. Bu işlem geri alınamaz.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBlockConfirm(false)}
                                disabled={isProcessing}
                                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all duration-200"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={confirmBlock}
                                disabled={isProcessing}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : null}
                                Hesabı Bloke Et
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}