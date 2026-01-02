import React from "react";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    RefreshCw,
    Wallet
} from "lucide-react";

interface TransferConfirmationProps {
    amount: string;
    currencySymbol: string;
    fromAccountName?: string;
    recipientName: string | null;
    toIban: string;
    description: string;
    loading: boolean;
    onBack: () => void;
    onConfirm: () => void;
}

export default function TransferConfirmation({
    amount,
    currencySymbol,
    fromAccountName,
    recipientName,
    toIban,
    description,
    loading,
    onBack,
    onConfirm
}: TransferConfirmationProps) {

    // İsmi maskeleme fonksiyonunu burada da kullanabiliriz veya dışarıdan utils'den çekebiliriz.
    // Görsel tutarlılık için buraya ekledim.
    const maskName = (name: string): string => {
        const parts = name.split(" ");
        return parts
            .map((part) =>
                part.length > 2
                    ? part[0] + "*".repeat(part.length - 1)
                    : part[0] + "*"
            )
            .join(" ");
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Tutar Gösterimi */}
            <div className="bg-[#12131a] rounded-xl p-6 border border-[#740001]/30 flex flex-col items-center text-center shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#D3A625]/10 rounded-full blur-xl -mr-10 -mt-10 transition-all group-hover:bg-[#D3A625]/20"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#740001]/10 rounded-full blur-xl -ml-10 -mb-10 transition-all group-hover:bg-[#740001]/20"></div>
                <span className="text-[#D3A625] text-sm mb-1 uppercase tracking-wide font-semibold relative z-10">Gönderilecek Tutar</span>
                <div className="text-4xl font-bold text-white flex items-center gap-2 relative z-10 drop-shadow-md">
                    {amount}
                    <span className="text-[#D3A625]">
                        {currencySymbol}
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {/* Gönderen */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#740001]/20 bg-[#12131a] hover:bg-[#740001]/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#740001]/20 rounded-lg border border-[#740001]/30">
                            <Wallet className="w-5 h-5 text-[#D3A625]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#D3A625]/70 uppercase font-semibold">Gönderen Hesap</p>
                            <p className="text-sm font-bold text-white tracking-wide">{fromAccountName || "Hesap Seçilmedi"}</p>
                        </div>
                    </div>
                </div>

                {/* Ok İşareti */}
                <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-[#0f1015] p-1.5 rounded-full border border-[#D3A625]/30 shadow-md">
                        <ArrowRight className="w-5 h-5 text-[#D3A625] transform rotate-90" />
                    </div>
                </div>

                {/* Alıcı */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#D3A625]/20 bg-[#12131a] hover:bg-[#D3A625]/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#D3A625]/10 rounded-lg border border-[#D3A625]/30">
                            <Building2 className="w-5 h-5 text-[#D3A625]" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-[#D3A625]/70 uppercase font-semibold">Alıcı</p>
                            <p className="text-sm font-bold text-white truncate w-full tracking-wide">
                                {recipientName ? maskName(recipientName) : "Bilinmiyor"}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono truncate">{toIban}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Açıklama */}
            {description && (
                <div className="bg-[#111827]/50 p-4 rounded-xl border border-[#740001]/20">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Açıklama</p>
                    <p className="text-sm text-gray-200 italic">"{description}"</p>
                </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="flex-1 bg-[#12131a] hover:bg-[#740001]/20 border border-[#740001]/30 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                >
                    Geri Dön
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-[2] bg-gradient-to-r from-[#2ecc71] to-[#27ae60] hover:from-[#27ae60] hover:to-[#2ecc71] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg shadow-green-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 border border-green-500/30"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>İşleniyor...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Onayla ve Gönder</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}