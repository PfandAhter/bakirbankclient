// TypeScript React (TSX)
import { useState } from 'react';
import { Lock, Unlock, Download } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/src/types/card';

// --- AYARLAR ---
const CARD_BACKGROUNDS: Record<string, string> = {
    'VISA': '/images/cards/visa-bg.png',
    'MASTERCARD': '/images/cards/mastercard-bg.jpg',
    'AMEX': '/images/cards/amex-bg.png',
    'TROY': '/images/cards/troy-bg.png',
    'DEFAULT': '/images/cards/default.png'
};

const DEBIT_BACKGROUNDS: Record<string, string> = {
    'VISA': '/images/cards/debit-visa.png',
    'MASTERCARD': '/images/cards/debit-mastercard.png',
    'AMEX': '/images/cards/debit-amex.png',
    'TROY': '/images/cards/debit-troy.png',
    'DEFAULT': '/images/cards/default.png'
};

interface CardItemProps {
    card: Card;
    onToggleBlock: (id: string, status: string) => void;
}

export default function CardItem({ card, onToggleBlock }: CardItemProps) {
    const [showNumber, setShowNumber] = useState(false);

    const getCardBackgroundImage = (network?: string, type?: string) => {
        const key = (network || '').toUpperCase();
        // prefer debit-specific image when card is DEBIT and a matching file exists
        if ((type || '').toUpperCase() === 'DEBIT' && DEBIT_BACKGROUNDS[key]) {
            return DEBIT_BACKGROUNDS[key];
        }
        return CARD_BACKGROUNDS[key] || CARD_BACKGROUNDS['DEFAULT'];
    };

    /*const formatCardNumber = (num: string, show: boolean) => {
        if (show) return num.match(/.{1,4}/g)?.join(' ') || num;
        return `#### #### #### ${num.slice(-4)}`; //•••• •••• ••••
    };*/

    const formatCardNumber = (lastFour: string, show: boolean) => {
        console.log("formatCardNumber called with:", lastFour, show);
        if (show) return `#### #### #### ${lastFour}`;
        return `#### #### #### ${lastFour}`;//•••• •••• ••••
    }

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
        <div className="group w-full max-w-md mx-auto relative z-0">
            <div
                className={`relative isolate rounded-2xl p-6 shadow-2xl h-56 transition-all duration-300 hover:scale-[1.02] border border-white/10 overflow-hidden flex flex-col justify-between ${card.status === 'BLOCKED' ? 'grayscale opacity-80' : ''
                    }`}
            >
                <div className="absolute inset-0 z-[-1] bg-gray-900">
                    <Image
                        src={getCardBackgroundImage(card.network, card.type)}
                        alt={`${card.network} Card Background`}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="relative z-10 my-auto mt-24 pointer-events-none">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-white text-xl md:text-2xl font-mono tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] shadow-black">
                            {card.status === 'PENDING_APPROVAL' ? 'Onay Bekliyor' : formatCardNumber(card.lastFourDigits, showNumber)}
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNumber(!showNumber);
                            }}
                            className="pointer-events-auto text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full z-20"
                        >
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <p className="text-white/80 text-[10px] uppercase tracking-wider mb-0.5 drop-shadow-md font-bold">Kart
                            Sahibi</p>
                        <p className="text-white text-sm font-bold uppercase tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate max-w-[180px]">
                            {card.cardHolderName}
                        </p>
                    </div>
                    <div className="text-right mb-8">
                        {/*<p className="text-white/80 text-[10px] uppercase tracking-wider mb-0.5 drop-shadow-md font-bold">
                            {card.status !== 'PENDING_APPROVAL' && 'SKT'}
                        </p>*/}
                        <p className="text-white text-xm font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-mono">
                            {card.status !== 'PENDING_APPROVAL' && (() => {
                                const d = new Date(card.expiryDate);
                                if (!isNaN(d.getTime())) {
                                    const m = String(d.getMonth() + 1).padStart(2, '0');
                                    const y = String(d.getFullYear()).slice(-2);
                                    return `${m}/${y}`;
                                }
                                const iso = (card.expiryDate || '').match(/(\d{4})-(\d{2})/);
                                if (iso) return `${iso[2]}/${iso[1].slice(-2)}`;
                                return card.expiryDate;
                            })()}
                        </p>
                    </div>
                </div>

                <div className="absolute top-6 right-6 z-20">
                    {card.status === 'BLOCKED' && (
                        <span
                            className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg backdrop-blur-sm border border-red-400/30">
                            BLOKELİ
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-4 flex gap-3 relative z-10">
                <button
                    onClick={() => onToggleBlock(card.id, card.status)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all border ${card.status === 'ACTIVE'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                        }`}
                >
                    {card.status === 'ACTIVE' ? <><Lock size={16} /> Blokle</> : <><Unlock size={16} /> Aktifleştir</>}
                </button>

                <button
                    onClick={downloadDetails}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1e222d] text-gray-300 border border-[#2e3440] hover:bg-[#2e3440] hover:text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
                >
                    <Download size={16} /> Bilgi
                </button>
            </div>

            {card.type === 'CREDIT' && (
                <div className="mt-4 px-1 relative z-10">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Limit: <span className="text-gray-300 font-medium">{card.limitAmount}₺</span></span>
                        <span className="text-[#D3A625] font-medium">
                            {(card.limitAmount || 0) - (card.availableAmount || 0)}₺ Müsait
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-[#D3A625] to-[#EEBA30] shadow-[0_0_10px_rgba(211,166,37,0.5)]"
                            style={{ width: `${((card.availableAmount || 0) / (card.limitAmount || 1)) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}