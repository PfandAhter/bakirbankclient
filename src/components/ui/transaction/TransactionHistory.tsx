'use client';

import { useState } from 'react';
import { FileText, ArrowUpRight, ArrowDownLeft, RefreshCw, Download, Clock, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Account } from '@/src/types/account';
import { Transaction } from '@/src/types/transaction';
import TransactionDetailModal from './TransactionDetailModal';

interface Props {
    transactions: Transaction[];
    selectedAccount?: Account;
    loadingInvoices: Record<string, boolean>;
    onInvoiceClick: (invoiceId: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}

export default function TransactionHistory({
    transactions,
    selectedAccount,
    loadingInvoices,
    onInvoiceClick,
    page,
    totalPages,
    onPageChange
}: Props) {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    return (
        <>
            <div className="bg-[#0f1015]/80 backdrop-blur-md border border-[#740001]/30 rounded-2xl shadow-xl flex flex-col min-h-[600px] relative z-0">
                {/* Header */}
                <div className="p-6 border-b border-[#740001]/30 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#D3A625]" />
                        Hesap Hareketleri
                    </h3>
                    <div className="text-xs text-[#D3A625] bg-[#740001]/20 px-3 py-1 rounded-lg">
                        Sayfa {page + 1} / {totalPages}
                    </div>
                </div>

                {/* Liste */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <FileText className="w-12 h-12 mb-2 opacity-20 text-[#740001]" />
                            <p>Bu filtrelerde işlem bulunamadı.</p>
                        </div>
                    ) : (
                        transactions.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between p-4 bg-[#12131a]/60 rounded-xl hover:bg-[#740001]/10 transition-colors border border-transparent hover:border-[#740001]/30 group cursor-pointer"
                                onClick={() => setSelectedTransaction(t)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${t.type === "INCOME" ? "bg-[#D3A625]/20 text-[#D3A625]" : "bg-[#740001]/20 text-[#740001]"}`}>
                                        {t.type === "INCOME" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{t.description}</p>
                                        <p className="text-gray-500 text-xs">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Detay Butonu */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTransaction(t);
                                        }}
                                        className="hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all bg-[#740001]/20 text-[#D3A625] hover:bg-[#740001]/30"
                                    >
                                        <Eye className="w-3 h-3" />
                                        Detay
                                    </button>

                                    {/* Dekont Butonu */}
                                    {(t.invoiceStatus === 'COMPLETED' || t.invoiceStatus === 'PENDING') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                t.invoiceId ? onInvoiceClick(t.invoiceId) : undefined;
                                            }}
                                            disabled={!t.invoiceId || (t.invoiceId && loadingInvoices[t.invoiceId]) || t.invoiceStatus === 'PENDING'}
                                            className={`hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${t.invoiceStatus === 'COMPLETED' ? 'bg-[#D3A625]/20 text-[#D3A625] hover:bg-[#D3A625]/30' : 'bg-amber-500/10 text-amber-400 cursor-wait'}`}
                                        >
                                            {(t.invoiceId && loadingInvoices[t.invoiceId]) ? <RefreshCw className="w-3 h-3 animate-spin" /> : t.invoiceStatus === 'COMPLETED' ? <><Download className="w-3 h-3" /> Dekont</> : <><Clock className="w-3 h-3" /> Hazırlanıyor</>}
                                        </button>
                                    )}

                                    <div className="text-right">
                                        <p className={`font-bold text-base ${t.type === "INCOME" ? "text-[#D3A625]" : "text-[#740001]"}`}>
                                            {t.type === "INCOME" ? "+" : "-"}
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedAccount?.currency || 'TRY' }).format(t.amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-[#740001]/30 flex justify-between items-center bg-[#0f1015]/50 rounded-b-2xl">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-[#12131a] border border-[#740001]/30 rounded-lg hover:bg-[#740001]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Önceki
                    </button>

                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                            return (
                                <div key={idx} className={`w-2 h-2 rounded-full ${idx === (page % 5) ? 'bg-[#D3A625]' : 'bg-[#740001]/50'}`} />
                            )
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages - 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-[#12131a] border border-[#740001]/30 rounded-lg hover:bg-[#740001]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Sonraki
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Transaction Detail Modal */}
            {selectedTransaction && (
                <TransactionDetailModal
                    transaction={selectedTransaction}
                    currency={selectedAccount?.currency}
                    isOpen={!!selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onInvoiceClick={onInvoiceClick}
                    loadingInvoice={selectedTransaction.invoiceId ? loadingInvoices[selectedTransaction.invoiceId] : false}
                />
            )}
        </>
    );
}