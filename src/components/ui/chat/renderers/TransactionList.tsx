import React from 'react';
import { Transaction } from '@/src/types/chat';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionListProps {
    transactions: Transaction[];
    totalElements?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    return (
        <div className="flex flex-col gap-3 p-2">
            {transactions.map((txn) => (
                <div
                    key={txn.id}
                    className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-xl border border-transparent transition-colors duration-200 hover:bg-white/5"
                >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.amount > 0
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                        {txn.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="flex-1 flex flex-col">
                        <span className="font-medium text-[0.95rem]">{txn.merchantName}</span>
                        <span className="text-xs opacity-60">{new Date(txn.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className={`font-semibold ${txn.amount > 0 ? 'text-emerald-500' : 'text-slate-50'}`}>
                        {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {txn.currency}
                    </div>
                </div>
            ))}
        </div>
    );
};
