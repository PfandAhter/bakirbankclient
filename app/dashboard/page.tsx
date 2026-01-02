'use client';

import { useAuth } from '@/src/hooks/login/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Eye,
    EyeOff,
    RefreshCw,
    Send,
    PiggyBank,
    Landmark,
    Plus,
    FileText,
    Loader2,
    CreditCard,
    Shield,
    Sparkles
} from 'lucide-react';

import NotificationPanel from "@/src/components/ui/notification/NotificationPanel";
import { AnalysisReportCard } from '@/src/components/ui/analysis/AnalysisReportCard';
import { CreateAnalysisModal } from '@/src/components/ui/analysis/CreateAnalysisModal';
import { useDashboard } from '@/src/hooks/useDashboard';
import Header from "@/src/components/ui/Header";

export default function DashboardPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [showBalance, setShowBalance] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

    // useDashboard hook'u ile tüm verileri yönet
    const {
        accounts,
        selectedAccount,
        setSelectedAccount,
        transactions,
        cards,
        analysisReports,
        stats,
        cardCountByAccount,
        totalCardCount,
        isLoadingAccounts,
        isLoadingTransactions,
        isLoadingCards,
        isLoadingAnalysis,
        isCreatingAnalysis,
        createAnalysis,
        downloadPdf,
        refreshAll
    } = useDashboard({ isAuthenticated });

    const isLoading = isLoadingAccounts;

    // PDF Download handler
    const handleDownloadPdf = async (invoiceId: string) => {
        setDownloadingPdfId(invoiceId);
        await downloadPdf(invoiceId);
        setDownloadingPdfId(null);
    };

    // Create Analysis handler
    const handleCreateAnalysis = async (range: 'LAST_7_DAYS' | 'LAST_30_DAYS') => {
        const success = await createAnalysis(range);
        if (success) {
            setIsCreateModalOpen(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#D3A625] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Yönlendiriliyor...</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-[#D3A625] animate-spin mx-auto mb-4" />
                    <p className="text-white">Hesap bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0b0f] relative">
            {/* Gryffindor ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#740001]/8 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D3A625]/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
            </div>

            {/* Header */}
            <Header user={user} pageName={"| Hesap Özetim"} logout={logout} onLogoClick={() => router.push('/')} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Balance Card - Gryffindor Theme */}
                <div className="bg-gradient-to-r from-[#740001] via-[#8B1A1A] to-[#5C0001] rounded-2xl p-8 mb-8 text-white border border-[#D3A625]/20 shadow-lg shadow-[#740001]/20">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-medium opacity-90 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#D3A625]" />
                                Toplam Bakiye
                            </h2>
                            <div className="flex items-center space-x-3 mt-2">
                                <p className="text-4xl font-bold">
                                    {showBalance ? formatCurrency(stats.totalBalance) : '••••••••'}
                                </p>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="p-2 hover:bg-[#D3A625]/20 rounded-lg transition-colors border border-[#D3A625]/30"
                                >
                                    {showBalance ? <EyeOff className="w-5 h-5 text-[#D3A625]" /> : <Eye className="w-5 h-5 text-[#D3A625]" />}
                                </button>
                            </div>
                            <p className="text-sm opacity-70 mt-2 text-[#D3A625]">{accounts.length} hesap</p>
                        </div>
                        <div className="text-right">
                            <div className="w-14 h-14 bg-[#D3A625]/20 rounded-xl flex items-center justify-center border border-[#D3A625]/30">
                                <Wallet className="w-8 h-8 text-[#D3A625]" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="bg-[#D3A625]/20 hover:bg-[#D3A625]/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 border border-[#D3A625]/30"
                        >
                            <Send className="w-4 h-4 text-[#D3A625]" />
                            <span>Para Gönder</span>
                        </button>
                        <button className="bg-[#D3A625]/20 hover:bg-[#D3A625]/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 border border-[#D3A625]/30">
                            <ArrowDownLeft className="w-4 h-4 text-[#D3A625]" />
                            <span>Para Yatır</span>
                        </button>
                        <button
                            onClick={refreshAll}
                            className="bg-[#D3A625]/20 hover:bg-[#D3A625]/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 border border-[#D3A625]/30"
                        >
                            <RefreshCw className="w-4 h-4 text-[#D3A625]" />
                            <span>Yenile</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid - Gryffindor Theme */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Monthly Income */}
                    <div className="bg-[#0f1015]/80 backdrop-blur-md border border-[#740001]/30 rounded-xl p-6 hover:border-[#D3A625]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Toplam Gelir</p>
                                <p className="text-2xl font-bold text-[#D3A625]">
                                    {formatCurrency(stats.totalIncome)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-[#D3A625] to-[#B8941F] rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Monthly Expenses */}
                    <div className="bg-[#0f1015]/80 backdrop-blur-md border border-[#740001]/30 rounded-xl p-6 hover:border-[#D3A625]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Toplam Gider</p>
                                <p className="text-2xl font-bold text-[#740001]">
                                    {formatCurrency(stats.totalExpenses)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-[#740001] to-[#5C0001] rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-[#D3A625]" />
                            </div>
                        </div>
                    </div>

                    {/* Total Accounts */}
                    <div className="bg-[#0f1015]/80 backdrop-blur-md border border-[#740001]/30 rounded-xl p-6 hover:border-[#D3A625]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Hesap Sayısı</p>
                                <p className="text-2xl font-bold text-[#D3A625]">
                                    {accounts.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-[#8B1A1A] to-[#740001] rounded-lg flex items-center justify-center border border-[#D3A625]/30">
                                <DollarSign className="w-6 h-6 text-[#D3A625]" />
                            </div>
                        </div>
                    </div>

                    {/* Total Cards */}
                    <div className="bg-[#0f1015]/80 backdrop-blur-md border border-[#740001]/30 rounded-xl p-6 hover:border-[#D3A625]/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Kart Sayısı</p>
                                <p className="text-2xl font-bold text-[#D3A625]">
                                    {totalCardCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-[#D3A625] to-[#740001] rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accounts List - Gryffindor Theme */}
                <div className="bg-[#0f1015]/80 backdrop-blur-md border border-[#740001]/30 rounded-xl mb-8">
                    <div className="p-6 border-b border-[#740001]/30">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-[#D3A625]" />
                            Hesaplarım
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accounts.map((account) => (
                                <div
                                    key={account.id}
                                    onClick={() => setSelectedAccount(account)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAccount?.id === account.id
                                        ? 'border-[#D3A625] bg-[#740001]/20 shadow-lg shadow-[#740001]/10'
                                        : 'border-[#740001]/30 bg-[#12131a]/50 hover:border-[#D3A625]/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#740001] to-[#5C0001] rounded-lg flex items-center justify-center border border-[#D3A625]/30">
                                            <Wallet className="w-5 h-5 text-[#D3A625]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{account.name}</p>
                                            <p className="text-gray-400 text-xs truncate">{account.iban}</p>
                                        </div>
                                    </div>

                                    {account.description && (
                                        <p className="text-gray-500 text-xs mb-3 italic">{account.description}</p>
                                    )}

                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xl font-bold text-[#D3A625]">
                                            {showBalance ? formatCurrency(account.balance) : '••••••'}
                                        </p>
                                        {cardCountByAccount[account.id] !== undefined && (
                                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                                <CreditCard className="w-4 h-4 text-[#D3A625]" />
                                                <span>{cardCountByAccount[account.id]} kart</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Günlük Limitler */}
                                    <div className="pt-3 border-t border-[#740001]/30 space-y-2">
                                        <p className="text-gray-500 text-xs font-medium mb-2">Günlük Limitler</p>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="bg-[#740001]/20 rounded-lg p-2 text-center border border-[#740001]/30">
                                                <Send className="w-3 h-3 text-[#D3A625] mx-auto mb-1" />
                                                <p className="text-gray-400">Transfer</p>
                                                <p className="text-white font-medium">{formatCurrency(account.dailyTransferLimit)}</p>
                                            </div>
                                            <div className="bg-[#740001]/20 rounded-lg p-2 text-center border border-[#740001]/30">
                                                <ArrowUpRight className="w-3 h-3 text-[#D3A625] mx-auto mb-1" />
                                                <p className="text-gray-400">Çekim</p>
                                                <p className="text-white font-medium">{formatCurrency(account.dailyWithdrawLimit)}</p>
                                            </div>
                                            <div className="bg-[#740001]/20 rounded-lg p-2 text-center border border-[#740001]/30">
                                                <ArrowDownLeft className="w-3 h-3 text-[#D3A625] mx-auto mb-1" />
                                                <p className="text-gray-400">Yatırma</p>
                                                <p className="text-white font-medium">{formatCurrency(account.dailyDepositLimit)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Two Column Layout: Transactions & Analysis Reports */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Transactions - Gryffindor Theme */}
                    <div className="bg-[#0f1015]/80 backdrop-blur-md border border-[#740001]/30 rounded-xl">
                        <div className="p-6 border-b border-[#740001]/30">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <ArrowUpRight className="w-5 h-5 text-[#D3A625]" />
                                    Son İşlemler
                                </h3>
                                <button
                                    onClick={() => router.push('/transactions')}
                                    className="text-[#D3A625] hover:text-[#EEBA30] transition-colors"
                                >
                                    Tümünü Gör
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoadingTransactions ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-[#D3A625] animate-spin" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">Henüz işlem bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.slice(0, 5).map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-[#12131a]/50 rounded-lg hover:bg-[#740001]/10 transition-colors border border-[#740001]/20">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'INCOME'
                                                    ? 'bg-gradient-to-br from-[#D3A625] to-[#B8941F]'
                                                    : 'bg-gradient-to-br from-[#740001] to-[#5C0001]'
                                                    }`}>
                                                    {transaction.type === 'INCOME'
                                                        ? <ArrowUpRight className="w-5 h-5 text-white" />
                                                        : <ArrowDownLeft className="w-5 h-5 text-[#D3A625]" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{transaction.description}</p>
                                                    <p className="text-gray-400 text-sm">{transaction.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${transaction.type === 'INCOME'
                                                    ? 'text-[#D3A625]'
                                                    : 'text-[#740001]'
                                                    }`}>
                                                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                </p>
                                                <p className="text-gray-400 text-sm">{formatDate(transaction.date)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analysis Reports Section - Gryffindor Theme */}
                    <div className="bg-[#0f1015]/80 backdrop-blur-md border border-[#740001]/30 rounded-xl">
                        <div className="p-6 border-b border-[#740001]/30">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-[#D3A625]" />
                                    <h3 className="text-xl font-semibold text-white">Analiz Raporları</h3>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    disabled={isCreatingAnalysis}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] disabled:opacity-50 text-white rounded-lg font-medium transition-all border border-[#D3A625]/20"
                                >
                                    <Sparkles className="w-4 h-4 text-[#D3A625]" />
                                    Yeni Analiz
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoadingAnalysis ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-[#D3A625] animate-spin" />
                                </div>
                            ) : analysisReports.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-[#740001]/50 mx-auto mb-4" />
                                    <p className="text-gray-400">Henüz analiz raporu bulunmuyor.</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Yeni bir analiz oluşturmak için yukarıdaki butonu kullanın.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {analysisReports.map((report) => (
                                        <AnalysisReportCard
                                            key={report.id}
                                            report={report}
                                            onDownloadPdf={handleDownloadPdf}
                                            isDownloading={downloadingPdfId === report.invoiceId}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Analysis Modal */}
            <CreateAnalysisModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateAnalysis}
            />
        </div>
    );
}