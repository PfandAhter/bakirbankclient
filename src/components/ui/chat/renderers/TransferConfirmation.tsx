'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle, XCircle, Wallet, CreditCard } from 'lucide-react';

interface TransferPreview {
    fromAccountName?: string;
    fromAccountIban?: string;
    toIban: string;
    toName?: string;
    amount: number;
    currency: string;
    description?: string;
}

interface TransferConfirmationProps {
    preview: TransferPreview;
    onConfirm: () => void;
    onReject: () => void;
}

export const TransferConfirmation: React.FC<TransferConfirmationProps> = ({
                                                                              preview,
                                                                              onConfirm,
                                                                              onReject
                                                                          }) => {
    const [responded, setResponded] = useState(false);

    const handleConfirm = () => {
        if (responded) return;
        setResponded(true);
        onConfirm();
    };

    const handleReject = () => {
        if (responded) return;
        setResponded(true);
        onReject();
    };

    return (
        <div className="w-full mt-2 rounded-xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <CreditCard size={18} />
                </div>
                <span className="font-semibold text-amber-400">Transfer Onayı</span>
            </div>

            {/* Transfer Details */}
            <div className="flex items-center gap-3 mb-4">
                {/* From */}
                <div className="flex-1 p-3 rounded-lg bg-black/20 border border-white/5">
                    <div className="text-xs text-white/50 mb-1">Gönderen Hesap</div>
                    <div className="font-medium text-slate-50">
                        {preview.fromAccountName || 'Hesabınız'}
                    </div>
                    {preview.fromAccountIban && (
                        <div className="text-xs text-white/40 mt-0.5 truncate">
                            {preview.fromAccountIban}
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                    <ArrowRight size={16} />
                </div>

                {/* To */}
                <div className="flex-1 p-3 rounded-lg bg-black/20 border border-white/5">
                    <div className="text-xs text-white/50 mb-1">Alıcı</div>
                    <div className="font-medium text-slate-50">
                        {preview.toName || 'Alıcı'}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 truncate">
                        {preview.toIban}
                    </div>
                </div>
            </div>

            {/* Amount */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-3">
                <div className="text-xs text-emerald-400/70 mb-1">Tutar</div>
                <div className="text-xl font-bold text-emerald-400">
                    {preview.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {preview.currency}
                </div>
            </div>

            {/* Description */}
            {preview.description && (
                <div className="p-3 rounded-lg bg-black/20 border border-white/5 mb-4">
                    <div className="text-xs text-white/50 mb-1">Açıklama</div>
                    <div className="text-sm text-slate-50">{preview.description}</div>
                </div>
            )}

            {/* Buttons */}
            {!responded ? (
                <div className="flex gap-3">
                    <button
                        onClick={handleConfirm}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]"
                    >
                        <CheckCircle size={18} />
                        Evet, Onayla
                    </button>
                    <button
                        onClick={handleReject}
                        className="flex-1 py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-slate-50 font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
                    >
                        <XCircle size={18} />
                        Hayır, İptal
                    </button>
                </div>
            ) : (
                <div className="text-center py-2 text-white/50 text-sm">
                    ✓ Yanıtınız gönderildi
                </div>
            )}
        </div>
    );
};
