import { Wallet, Send, ArrowDownLeft, Users } from 'lucide-react';

interface Props {
    onTransfer: () => void;
    onDeposit: () => void;
    onRecipients: () => void;
}

export default function QuickActions({ onTransfer, onDeposit, onRecipients }: Props) {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet className="w-32 h-32 text-white" /></div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-lg font-semibold text-white/90">Hızlı İşlemler</h2>
                    <p className="text-blue-100 text-sm mt-1">Para transferi yapın veya hesabınıza bakiye yükleyin.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button onClick={onTransfer} className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold text-white backdrop-blur-sm shadow-lg border border-white/10">
                        <Send className="w-4 h-4" /> Para Gönder
                    </button>
                    <button onClick={onDeposit} className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-bold shadow-lg">
                        <ArrowDownLeft className="w-4 h-4" /> Para Yatır
                    </button>
                    <button onClick={onRecipients} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold text-white backdrop-blur-sm shadow-lg border border-white/5">
                        <Users className="w-4 h-4" /> Kayıtlı Alıcılar
                    </button>
                </div>
            </div>
        </div>
    );
}