import React from 'react';
import { UserAccount } from '@/src/types/chat';
import { CreditCard, Wallet } from 'lucide-react';

interface AccountSelectorProps {
    accounts: UserAccount[];
    onSelect: (account: UserAccount) => void;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({ accounts, onSelect }) => {
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-2">
            {accounts.map((account) => (
                <button
                    key={account.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left cursor-pointer transition-all duration-200 flex flex-col gap-3 text-slate-50 hover:bg-white/10 hover:border-indigo-500 hover:-translate-y-0.5"
                    onClick={() => onSelect(account)}
                >
                    <div className="w-10 h-10 rounded-[10px] bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                        {account.currency === 'TRY' ? <Wallet size={24} /> : <CreditCard size={24} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-[0.9rem] mb-0.5">
                            {account.name || (account as any).nickname}
                        </span>
                        <span className="text-xs opacity-60 mb-2">
                            {account.iban || (account as any).accountIBAN}
                        </span>
                        {account.balance !== undefined && (
                            <span className="text-[1.1rem] font-bold tracking-wide">
                                {account.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {account.currency}
                            </span>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
};
