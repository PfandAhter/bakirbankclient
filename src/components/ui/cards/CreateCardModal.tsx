import { useState } from 'react';
import { X, CreditCard, Sparkles } from 'lucide-react';
import { CardType, CardNetwork } from '@/src/types/card';
import { Account } from '@/src/types/account';

interface CreateCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<boolean>;
    accounts: Account[];
}

export default function CreateCardModal({ isOpen, onClose, onSubmit, accounts }: CreateCardModalProps) {
    const [type, setType] = useState<CardType>('DEBIT');
    const [brand, setBrand] = useState<CardNetwork>('VISA');
    const [accountId, setAccountId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit({
            accountId,
            cardType: type,
            cardNetwork: brand,
        });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1015] border border-[#740001]/30 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#740001] to-[#5C0001] rounded-xl flex items-center justify-center border border-[#D3A625]/30">
                            <CreditCard className="w-5 h-5 text-[#D3A625]" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Yeni Kart Başvurusu</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-[#740001]/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Bağlı Hesap Seçin</label>
                        <select
                            required
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="w-full bg-[#12131a] border border-[#740001]/30 rounded-lg p-3 text-white focus:border-[#D3A625] outline-none"
                        >
                            <option value="">Hesap Seçiniz</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name} - {acc.iban}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Kart Tipi</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['CREDIT', 'DEBIT'] as CardType[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`p-3 rounded-lg border text-sm font-semibold transition-all ${type === t
                                            ? 'bg-[#740001]/30 border-[#D3A625] text-[#D3A625]'
                                            : 'bg-[#12131a] border-[#740001]/30 text-gray-400 hover:border-[#D3A625]/50'
                                        }`}
                                >
                                    {t === 'CREDIT' ? 'Kredi Kartı' : 'Banka Kartı'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Kart Markası</label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['VISA', 'MASTERCARD', 'AMEX', 'TROY'] as CardNetwork[]).map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => setBrand(b)}
                                    className={`p-3 rounded-lg border text-xs font-bold transition-all ${brand === b
                                            ? 'bg-[#740001]/30 border-[#D3A625] text-[#D3A625]'
                                            : 'bg-[#12131a] border-[#740001]/30 text-gray-500 hover:border-[#D3A625]/50'
                                        }`}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !accountId}
                        className="w-full bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold mt-4 transition-all flex items-center justify-center gap-2 border border-[#D3A625]/20"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-[#D3A625] border-t-transparent rounded-full animate-spin" />
                                İşleniyor...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 text-[#D3A625]" />
                                Kartı Oluştur
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}