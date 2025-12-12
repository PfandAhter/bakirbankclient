import { FileText, ArrowUpRight, ArrowDownLeft, RefreshCw, Download, Clock } from 'lucide-react';
import { Account } from '@/src/types/account';
import { Transaction } from '@/src/types/transaction';

interface Props {
    transactions: Transaction[];
    selectedAccount?: Account;
    loadingInvoices: Record<string, boolean>;
    onInvoiceClick: (id: string, status: string) => void;
}

export default function TransactionHistory({ transactions, selectedAccount, loadingInvoices, onInvoiceClick }: Props) {
    return (
        <div className="bg-[#0c0d13]/50 backdrop-blur-md border border-[#1e222d] rounded-2xl shadow-xl flex flex-col min-h-[600px]">
            <div className="p-6 border-b border-[#1e222d] flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Hesap Hareketleri</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">Tümünü Gör</button>
            </div>

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
                                    <button onClick={() => onInvoiceClick(t.id, t.invoiceStatus!)} disabled={loadingInvoices[t.id] || t.invoiceStatus === 'PENDING'} className={`hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${t.invoiceStatus === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-amber-500/10 text-amber-400 cursor-wait'}`}>
                                        {loadingInvoices[t.id] ? <RefreshCw className="w-3 h-3 animate-spin" /> : t.invoiceStatus === 'COMPLETED' ? <><Download className="w-3 h-3" /> Dekont</> : <><Clock className="w-3 h-3" /> Hazırlanıyor</>}
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
        </div>
    );
}