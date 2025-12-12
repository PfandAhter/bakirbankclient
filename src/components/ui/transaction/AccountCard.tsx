import { Account } from '@/src/types/dashboard';
import { CreditCard, Eye, EyeOff, ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

interface AccountCardProps {
    accounts: Account[];
    selectedAccount: Account | null;
    onSelectAccount: (acc: Account) => void;
    onNewAccount: () => void;
}

export default function AccountCard({ accounts, selectedAccount, onSelectAccount, onNewAccount }: AccountCardProps) {
    const [showBalance, setShowBalance] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const formatCurrency = (amount: number, currency: string) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);

    return (
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#1e222d] rounded-2xl p-6 shadow-xl relative z-20 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4 flex-1">
                    <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                        <CreditCard className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="relative">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Aktif Hesap</p>
                        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 group">
                            <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                {selectedAccount?.name || 'Hesap Seçiniz'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <p className="text-gray-500 text-xs font-mono mt-1">{selectedAccount?.iban}</p>

                        {isOpen && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-[#0f172a] border border-[#1e222d] rounded-xl shadow-2xl overflow-hidden z-50">
                                {accounts.map((acc) => (
                                    <button key={acc.id}
                                            onClick={() => { onSelectAccount(acc); setIsOpen(false); }}
                                            className="w-full text-left p-3 hover:bg-[#1e293b] flex justify-between items-center border-b border-[#1e222d]/50 last:border-0"
                                    >
                                        <div>
                                            <p className="text-white text-sm font-medium">{acc.name}</p>
                                            <p className="text-gray-500 text-[10px] font-mono">{acc.iban}</p>
                                        </div>
                                        <p className="text-blue-400 text-xs font-bold">{formatCurrency(acc.balance, acc.currency)}</p>
                                    </button>
                                ))}
                                <button onClick={() => { onNewAccount(); setIsOpen(false); }} className="w-full p-3 bg-blue-600/10 text-blue-400 text-xs font-bold hover:bg-blue-600/20 flex items-center justify-center gap-2">
                                    <Plus className="w-3 h-3"/> Yeni Hesap Oluştur
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-right w-full sm:w-auto bg-[#000000]/20 p-4 rounded-xl border border-white/5">
                    <p className="text-gray-400 text-xs mb-1">Toplam Bakiye</p>
                    <div className="flex items-center justify-end gap-3">
                        <p className="text-2xl font-bold text-white tracking-tight">
                            {showBalance && selectedAccount
                                ? formatCurrency(selectedAccount.balance, selectedAccount.currency)
                                : "••••••••"}
                        </p>
                        <button onClick={() => setShowBalance(!showBalance)} className="text-gray-500 hover:text-white transition-colors">
                            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}