import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { CardType, CardNetwork } from '@/src/types/card';
import { Account }  from '@/src/types/account';

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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1e222d] border border-gray-700 rounded-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Yeni Kart Başvurusu</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Bağlı Hesap Seçin</label>
                        <select
                            required
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="w-full bg-[#0a0b0f] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
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
                                    className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                                        type === t
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                            : 'bg-[#0a0b0f] border-gray-700 text-gray-400 hover:border-gray-600'
                                    }`}
                                >
                                    {t === 'CREDIT' ? 'Kredi Kartı' : 'Banka Kartı'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Kart Markası</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['VISA', 'MASTERCARD', 'AMEX', 'TROY'] as CardNetwork[]).map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => setBrand(b)}
                                    className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                                        brand === b
                                            ? 'bg-white/10 border-white text-white'
                                            : 'bg-[#0a0b0f] border-gray-700 text-gray-500 hover:border-gray-600'
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
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold mt-4 transition-colors"
                    >
                        {isSubmitting ? 'İşleniyor...' : 'Kartı Oluştur'}
                    </button>
                </form>
            </div>
        </div>
    );
}