import { Wallet, Send, ArrowDownLeft, Users, Sparkles } from 'lucide-react';

interface Props {
    onTransfer: () => void;
    onDeposit: () => void;
    onRecipients: () => void;
}

export default function QuickActions({ onTransfer, onDeposit, onRecipients }: Props) {
    return (
        <div className="bg-gradient-to-r from-[#740001] to-[#8B1A1A] rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden border border-[#D3A625]/20">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet className="w-32 h-32 text-[#D3A625]" /></div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#D3A625]" />
                        Hızlı İşlemler
                    </h2>
                    <p className="text-[#D3A625]/70 text-sm mt-1">Para transferi yapın veya hesabınıza bakiye yükleyin.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button onClick={onTransfer} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold text-white backdrop-blur-sm shadow-lg border border-[#D3A625]/30">
                        <Send className="w-4 h-4 text-[#D3A625]" /> Para Gönder
                    </button>
                    <button onClick={onDeposit} className="bg-[#D3A625] text-[#0a0b0f] hover:bg-[#EEBA30] px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-bold shadow-lg">
                        <ArrowDownLeft className="w-4 h-4" /> Para Yatır
                    </button>
                    <button onClick={onRecipients} className="bg-white/5 hover:bg-white/15 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold text-white backdrop-blur-sm shadow-lg border border-[#D3A625]/20">
                        <Users className="w-4 h-4 text-[#D3A625]" /> Kayıtlı Alıcılar
                    </button>
                </div>
            </div>
        </div>
    );
}