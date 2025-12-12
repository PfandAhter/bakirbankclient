import { Transaction, FilterType, FilterDate } from '@/src/types/dashboard';
import { ArrowUpRight, ArrowDownLeft, FileText, Download, RefreshCw } from 'lucide-react';

interface TransactionListProps {
    transactions: Transaction[];
    isLoading: boolean;
    filterType: FilterType;
    setFilterType: (t: FilterType) => void;
    filterDate: FilterDate;
    setFilterDate: (d: FilterDate) => void;
    onInvoiceClick: (id: string, status: string) => void;
    loadingInvoiceId: string | null;
}

export default function TransactionList({
                                            transactions, isLoading, filterType, setFilterType, filterDate, setFilterDate, onInvoiceClick, loadingInvoiceId
                                        }: TransactionListProps) {

    const FilterButton = ({ active, label, onClick, colorClass }: any) => (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${active ? `${colorClass} text-white shadow-lg` : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-[#0c0d13]/50 backdrop-blur-md border border-[#1e222d] rounded-2xl shadow-xl flex flex-col min-h-[500px]">
            {/* Header & Filters */}
            <div className="p-6 border-b border-[#1e222d] space-y-4">
                <h3 className="text-xl font-bold text-white">Hesap Hareketleri</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex bg-[#0f172a] rounded-lg p-1 border border-[#1e222d]">
                        <FilterButton active={filterDate === 'ALL'} label="Tümü" onClick={() => setFilterDate('ALL')} colorClass="bg-blue-600" />
                        <FilterButton active={filterDate === 'WEEK'} label="Bu Hafta" onClick={() => setFilterDate('WEEK')} colorClass="bg-blue-600" />
                        <FilterButton active={filterDate === 'MONTH'} label="Bu Ay" onClick={() => setFilterDate('MONTH')} colorClass="bg-blue-600" />
                    </div>
                    <div className="flex bg-[#0f172a] rounded-lg p-1 border border-[#1e222d]">
                        <FilterButton active={filterType === 'ALL'} label="Tümü" onClick={() => setFilterType('ALL')} colorClass="bg-blue-600" />
                        <FilterButton active={filterType === 'INCOME'} label="Gelir" onClick={() => setFilterType('INCOME')} colorClass="bg-green-600" />
                        <FilterButton active={filterType === 'EXPENSE'} label="Gider" onClick={() => setFilterType('EXPENSE')} colorClass="bg-red-600" />
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                        <FileText className="w-12 h-12 mb-2" />
                        <p>Kayıt bulunamadı.</p>
                    </div>
                ) : (
                    transactions.map((t) => (
                        <div key={t.id} className="group flex items-center justify-between p-4 bg-[#1e293b]/30 hover:bg-[#1e293b]/80 rounded-xl transition-all border border-transparent hover:border-[#1e222d]">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === "INCOME" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                    {t.type === "INCOME" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">{t.description}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {(t.invoiceStatus === 'COMPLETED' || t.invoiceStatus === 'PENDING') && (
                                    <button
                                        onClick={() => onInvoiceClick(t.id, t.invoiceStatus!)}
                                        disabled={loadingInvoiceId === t.id}
                                        className={`hidden group-hover:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${t.invoiceStatus === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-amber-500/10 text-amber-400'}`}
                                    >
                                        {loadingInvoiceId === t.id ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Download className="w-3 h-3"/>}
                                        {t.invoiceStatus === 'COMPLETED' ? 'Dekont' : 'Hazırlanıyor'}
                                    </button>
                                )}
                                <span className={`font-bold text-base ${t.type === "INCOME" ? "text-green-400" : "text-red-400"}`}>
                                    {t.type === "INCOME" ? "+" : "-"}{t.amount} ₺
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}