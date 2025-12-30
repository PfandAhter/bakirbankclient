import { FileText, ArrowUpRight, ArrowDownLeft, RefreshCw, Download, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Account } from '@/src/types/account';
import { Transaction } from '@/src/types/transaction';

interface Props {
    transactions: Transaction[];
    selectedAccount?: Account;
    loadingInvoices: Record<string, boolean>;
    onInvoiceClick: (invoiceId: string) => void;
    // YENİ EKLENEN PROPLAR
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
    return (
        <div className="bg-[#0c0d13]/50 backdrop-blur-md border border-[#1e222d] rounded-2xl shadow-xl flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-[#1e222d] flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Hesap Hareketleri</h3>
                <div className="text-xs text-gray-400">
                    Sayfa {page + 1} / {totalPages}
                </div>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <FileText className="w-12 h-12 mb-2 opacity-20" />
                        <p>Bu filtrelerde işlem bulunamadı.</p>
                    </div>
                ) : (
                    transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-[#1e293b]/40 rounded-xl hover:bg-[#1e293b]/60 transition-colors border border-transparent hover:border-[#1e222d] group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${t.type === "INCOME" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                    {t.type === "INCOME" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">{t.description}</p>
                                    <p className="text-gray-500 text-xs">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {(t.invoiceStatus === 'COMPLETED' || t.invoiceStatus === 'PENDING') && (
                                    <button
                                        onClick={() => t.invoiceId ? onInvoiceClick(t.invoiceId) : undefined}
                                        disabled={!t.invoiceId || (t.invoiceId && loadingInvoices[t.invoiceId]) || t.invoiceStatus === 'PENDING'}
                                        className={`hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${t.invoiceStatus === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-amber-500/10 text-amber-400 cursor-wait'}`}
                                    >
                                        {(t.invoiceId && loadingInvoices[t.invoiceId]) ? <RefreshCw className="w-3 h-3 animate-spin" /> : t.invoiceStatus === 'COMPLETED' ? <><Download className="w-3 h-3" /> Dekont</> : <><Clock className="w-3 h-3" /> Hazırlanıyor</>}
                                    </button>
                                )}
                                <div className="text-right">
                                    <p className={`font-bold text-base ${t.type === "INCOME" ? "text-green-400" : "text-red-400"}`}>
                                        {t.type === "INCOME" ? "+" : "-"}
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedAccount?.currency || 'TRY' }).format(t.amount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-[#1e222d] flex justify-between items-center bg-[#0c0d13]/30 rounded-b-2xl">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-[#1e293b] rounded-lg hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Önceki
                </button>

                <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        return (
                            <div key={idx} className={`w-2 h-2 rounded-full ${idx === (page % 5) ? 'bg-blue-500' : 'bg-gray-600'}`} />
                        )
                    })}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-[#1e293b] rounded-lg hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Sonraki
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}