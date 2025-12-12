// src/components/chat/renderers/BankNameList.tsx
'use client';

import React from 'react';
import { Building2 } from 'lucide-react';

type BankItem = string | { name: string; code?: string; logo?: string };

interface BankNameListProps {
    banks: BankItem[];
    onSelect: (bankName: string) => void;
}

const getBankName = (bank: BankItem): string => {
    return typeof bank === 'string' ? bank : bank.name;
};

const getBankCode = (bank: BankItem): string | undefined => {
    return typeof bank === 'string' ? undefined : bank.code;
};

const getBankLogo = (bank: BankItem): string | undefined => {
    return typeof bank === 'string' ? undefined : bank.logo;
};

export const BankNameList: React.FC<BankNameListProps> = ({ banks, onSelect }) => {
    return (
        <div className="w-full mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/20">
            <div className="p-3 border-b border-white/10 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-400" />
                <span className="text-sm font-medium text-slate-50">Banka Seçin</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
                {banks.map((bank, index) => {
                    const bankName = getBankName(bank);
                    const bankCode = getBankCode(bank);
                    const bankLogo = getBankLogo(bank);

                    return (
                        <button
                            key={bankCode || index}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-200 hover:bg-white/5 border-b border-white/5 last:border-b-0"
                            onClick={() => onSelect(bankName)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                                {bankLogo ? (
                                    <img src={bankLogo} alt={bankName} className="w-6 h-6 object-contain" />
                                ) : (
                                    <Building2 size={20} />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-50">{bankName}</span>
                                {bankCode && (
                                    <span className="text-xs text-white/50">{bankCode}</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
