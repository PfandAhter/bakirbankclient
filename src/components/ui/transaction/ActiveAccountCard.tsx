import { useState } from 'react';
import { CreditCard, ChevronDown, Eye, EyeOff, Shield } from 'lucide-react';
import { Account } from '@/src/types/account';
import { currencySymbols } from '@/src/types/currency';

interface Props {
    accounts: Account[];
    selectedAccount?: Account;
    onAccountSelect: (acc: Account) => void;
    onNewAccountClick: () => void;
}

export default function ActiveAccountCard({ accounts, selectedAccount, onAccountSelect, onNewAccountClick }: Props) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showBalance, setShowBalance] = useState(true);

    return (
        <div className="mb-8 relative z-20">
            <div className="bg-gradient-to-br from-[#0f1015] to-[#12131a] border border-[#740001]/30 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#740001] to-[#5C0001] rounded-xl flex items-center justify-center shadow-lg border border-[#D3A625]/30">
                            <Shield className="w-7 h-7 text-[#D3A625]" />
                        </div>
                        <div className="relative">
                            <p className="text-gray-400 text-sm mb-1">Aktif Hesap</p>
                            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2 group focus:outline-none">
                                <span className="text-xl font-bold text-white group-hover:text-[#D3A625] transition-colors">
                                    {selectedAccount?.name}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-[#D3A625] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            <p className="text-gray-500 text-xs mt-1 font-mono">{selectedAccount?.iban}</p>

                            {showDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-[#0f1015] border border-[#740001]/40 rounded-xl shadow-2xl overflow-hidden z-50">
                                    {accounts.map((acc) => (
                                        <button key={acc.id} onClick={() => { onAccountSelect(acc); setShowDropdown(false); }} className={`w-full text-left p-3 hover:bg-[#740001]/20 transition-all flex justify-between items-center ${selectedAccount?.id === acc.id ? 'bg-[#740001]/30 border-l-2 border-[#D3A625]' : ''}`}>
                                            <div><p className="text-white text-sm font-semibold">{acc.name}</p><p className="text-gray-500 text-[10px] font-mono">{acc.iban}</p></div>
                                            <p className="text-[#D3A625] text-xs font-bold">{currencySymbols[acc.currency]} {acc.balance.toLocaleString()}</p>
                                        </button>
                                    ))}
                                    <button onClick={() => { onNewAccountClick(); setShowDropdown(false); }} className="w-full text-center p-3 bg-[#740001]/30 hover:bg-[#740001]/50 text-[#D3A625] text-xs font-bold border-t border-[#740001]/40">
                                        Yeni Hesap Aç +
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-gray-400 text-sm mb-1">Güncel Bakiye</p>
                        <div className="flex items-center space-x-2 justify-end">
                            <p className="text-2xl font-bold text-[#D3A625] tracking-tight">
                                {showBalance
                                    ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedAccount?.currency || 'TRY' }).format(selectedAccount?.balance ?? 0)
                                    : "••••••••"}
                            </p>
                            <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-[#740001]/30 rounded-lg transition-colors">
                                {showBalance ? <Eye className="w-4 h-4 text-[#D3A625]" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}