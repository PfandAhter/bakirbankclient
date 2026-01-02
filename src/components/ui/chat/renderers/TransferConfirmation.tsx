'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle, XCircle, CreditCard, Ban } from 'lucide-react';

interface TransferPreview {
    fromAccountName?: string;
    fromAccountIban?: string;
    toIban?: string;
    toName?: string;
    amount?: number;
    currency?: string;
    description?: string;
}

interface TransferConfirmationProps {
    preview: TransferPreview;
    onConfirm: () => void;
    onReject: () => void;
}

type ResponseType = 'confirmed' | 'rejected' | null;

export const TransferConfirmation: React.FC<TransferConfirmationProps> = ({
    preview,
    onConfirm,
    onReject
}) => {
    const [responseType, setResponseType] = useState<ResponseType>(null);

    const handleConfirm = () => {
        if (responseType) return;
        setResponseType('confirmed');
        onConfirm();
    };

    const handleReject = () => {
        if (responseType) return;
        setResponseType('rejected');
        onReject();
    };

    // Format IBAN for display (show last 4 digits)
    const formatIban = (iban?: string) => {
        if (!iban) return '';
        if (iban.length > 8) {
            return `...${iban.slice(-8)}`;
        }
        return iban;
    };

    // Show collapsed rejection summary
    if (responseType === 'rejected') {
        return (
            <div className="w-full mt-2 rounded-lg overflow-hidden border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5 p-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-red-400">
                        <Ban size={14} />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-red-400 text-sm">Transfer İptal Edildi</span>
                        <div className="text-xs text-white/50 mt-0.5">
                            <span className="line-through opacity-60">
                                {(preview.amount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {preview.currency ?? 'TRY'}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="opacity-60">{preview.toName || 'Alıcı'}</span>
                        </div>
                    </div>
                    <XCircle size={18} className="text-red-400" />
                </div>
            </div>
        );
    }

    // Show collapsed confirmation summary (waiting for backend)
    if (responseType === 'confirmed') {
        return (
            <div className="w-full mt-2 rounded-lg overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CreditCard size={14} />
                    </div>
                    <div className="flex-1">
                        <span className="font-semibold text-emerald-400 text-sm">Transfer Onaylandı</span>
                        <div className="text-xs text-white/50 mt-0.5">
                            <span className="text-emerald-300">
                                {(preview.amount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {preview.currency ?? 'TRY'}
                            </span>
                            <span className="mx-2">→</span>
                            <span>{preview.toName || 'Alıcı'}</span>
                        </div>
                    </div>
                    <CheckCircle size={18} className="text-emerald-400" />
                </div>
            </div>
        );
    }

    // Full confirmation card (not responded yet)
    return (
        <div className="w-full mt-2 rounded-lg overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <CreditCard size={14} />
                </div>
                <span className="font-semibold text-amber-400 text-sm">Transfer Onayı</span>
            </div>

            {/* Compact Transfer Details */}
            <div className="flex items-center gap-2 mb-2 text-xs">
                <div className="flex-1 p-2 rounded bg-black/20 border border-white/5">
                    <div className="text-white/50 mb-0.5">Gönderen</div>
                    <div className="text-slate-50 truncate">{preview.fromAccountName || 'Hesabınız'}</div>
                    {preview.fromAccountIban && (
                        <div className="text-white/40 truncate">{formatIban(preview.fromAccountIban)}</div>
                    )}
                </div>
                <ArrowRight size={14} className="text-white/40 flex-shrink-0" />
                <div className="flex-1 p-2 rounded bg-black/20 border border-white/5">
                    <div className="text-white/50 mb-0.5">Alıcı</div>
                    <div className="text-slate-50 truncate">{preview.toName || 'Alıcı'}</div>
                    {preview.toIban && (
                        <div className="text-white/40 truncate">{formatIban(preview.toIban)}</div>
                    )}
                </div>
            </div>

            {/* Amount - Compact */}
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 mb-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400/70">Tutar</span>
                    <span className="text-lg font-bold text-emerald-400">
                        {(preview.amount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {preview.currency ?? 'TRY'}
                    </span>
                </div>
            </div>

            {/* Description - Compact */}
            {preview.description && (
                <div className="p-2 rounded bg-black/20 border border-white/5 mb-2 text-xs text-slate-300">
                    {preview.description}
                </div>
            )}

            {/* Buttons - Compact */}
            <div className="flex gap-2">
                <button
                    onClick={handleConfirm}
                    className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                >
                    <CheckCircle size={14} />
                    Onayla
                </button>
                <button
                    onClick={handleReject}
                    className="flex-1 py-2 px-3 rounded-lg bg-white/10 border border-white/20 text-slate-50 text-sm font-medium flex items-center justify-center gap-1.5 transition-all hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
                >
                    <XCircle size={14} />
                    İptal
                </button>
            </div>
        </div>
    );
};
