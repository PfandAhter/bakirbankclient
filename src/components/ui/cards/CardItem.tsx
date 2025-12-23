import { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Download } from 'lucide-react';
import { Card } from '@/src/types/card';

interface CardItemProps {
    card: Card;
    onToggleBlock: (id: string, status: string) => void;
}

export default function CardItem({ card, onToggleBlock }: CardItemProps) {
    const [showNumber, setShowNumber] = useState(false);

    const formatCardNumber = (num: string, show: boolean) => {
        if (show) return num.match(/.{1,4}/g)?.join(' ') || num;
        return `•••• •••• •••• ${num.slice(-4)}`;
    };

    const downloadDetails = () => {
        const text = `BAKIRBANK - ${card.type}\nKart No: ${card.cardNumber}\nSKT: ${card.expiryDate}\nCVV: ${card.cvv}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `card-${card.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="group">
            {/* Visual Card */}
            <div className={`relative rounded-2xl p-6 shadow-2xl h-56 transition-all duration-300 hover:scale-[1.02] border border-white/10 bg-gradient-to-br overflow-hidden ${
                card.status === 'BLOCKED' ? 'grayscale opacity-75' : ''
            } ${
                card.type === 'CREDIT' ? 'from-slate-900 to-slate-800' : 'from-blue-900 to-blue-800'
            }`}>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                {/* Top Row */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="w-12 h-8 bg-gradient-to-r from-yellow-200 to-yellow-500 rounded-md opacity-80" />
                    <span className="text-white font-bold text-xl tracking-widest italic">{card.network}</span>
                </div>

                {/* Middle - Number */}
                <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 z-10">
                    <div className="flex items-center justify-between">
                        <p className="text-white text-xl md:text-2xl font-mono tracking-wider drop-shadow-md">
                            {formatCardNumber(card.cardNumber, showNumber)}
                        </p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowNumber(!showNumber); }}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            {showNumber ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
                    <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Kart Sahibi</p>
                        <p className="text-white text-sm font-semibold uppercase tracking-wide">{card.cardHolderName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">SKT</p>
                        <p className="text-white text-sm font-semibold">
                            {(() => {
                                const d = new Date(card.expiryDate);
                                if (!isNaN(d.getTime())) {
                                    const m = String(d.getMonth() + 1).padStart(2, '0');
                                    const y = String(d.getFullYear()).slice(-2);
                                    return `${m}/${y}`;
                                }
                                const iso = (card.expiryDate || '').match(/(\d{4})-(\d{2})/);
                                if (iso) return `${iso[2]}/${iso[1].slice(-2)}`;
                                const fallback = (card.expiryDate || '').match(/(\d{2})\/?(\d{2,4})$/);
                                if (fallback) {
                                    const mon = fallback[1].padStart(2, '0');
                                    const yr = fallback[2].length === 4 ? fallback[2].slice(-2) : fallback[2];
                                    return `${mon}/${yr}`;
                                }
                                return card.expiryDate;
                            })()}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-6 right-24">
                    {card.status === 'BLOCKED' && (
                        <span className="bg-red-500/80 text-white text-xs px-2 py-1 rounded">BLOKELİ</span>
                    )}
                </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-4 flex gap-3">
                <button
                    onClick={() => onToggleBlock(card.id, card.status)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all border ${
                        card.status === 'ACTIVE'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                    }`}
                >
                    {card.status === 'ACTIVE' ? <><Lock size={16}/> Blokle</> : <><Unlock size={16}/> Aktifleştir</>}
                </button>

                <button
                    onClick={downloadDetails}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1e222d] text-gray-300 border border-[#2e3440] hover:bg-[#2e3440] hover:text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
                >
                    <Download size={16} /> Bilgi
                </button>
            </div>

            {/* Credit Card Bar */}
            {card.type === 'CREDIT' && (
                <div className="mt-4 px-1">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Limit: {card.creditLimit}₺</span>
                        <span className="text-blue-400">{(card.creditLimit || 0) - (card.usedCredit || 0)}₺ Müsait</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${((card.usedCredit || 0) / (card.creditLimit || 1)) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}