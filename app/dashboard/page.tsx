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
    CreditCard
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-white">Yönlendiriliyor...</div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">Hesap bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Header */}
            <Header user={user} pageName={"Hesap Özetim"} logout={logout} onLogoClick={() => router.push('/')} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 mb-8 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-medium opacity-90">Toplam Bakiye</h2>
                            <div className="flex items-center space-x-3 mt-2">
                                <p className="text-4xl font-bold">
                                    {showBalance ? formatCurrency(stats.totalBalance) : '••••••••'}
                                </p>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-sm opacity-70 mt-2">{accounts.length} hesap</p>
                        </div>
                        <div className="text-right">
                            <Wallet className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => router.push('/')}
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>Para Gönder</span>
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                            <ArrowDownLeft className="w-4 h-4" />
                            <span>Para Yatır</span>
                        </button>
                        <button
                            onClick={refreshAll}
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Yenile</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Monthly Income */}
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Toplam Gelir</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {formatCurrency(stats.totalIncome)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Monthly Expenses */}
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Toplam Gider</p>
                                <p className="text-2xl font-bold text-red-400">
                                    {formatCurrency(stats.totalExpenses)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Total Accounts */}
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Hesap Sayısı</p>
                                <p className="text-2xl font-bold text-blue-400">
                                    {accounts.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Total Cards */}
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Kart Sayısı</p>
                                <p className="text-2xl font-bold text-purple-400">
                                    {totalCardCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Selector - Banking Style */}
                <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl mb-8">
                    <div className="p-6 border-b border-gray-700">
                        <h3 className="text-xl font-semibold text-white">Hesap Seçimi</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Dropdown Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    İşlem yapılacak hesabı seçin
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedAccount?.id || ''}
                                        onChange={(e) => {
                                            const account = accounts.find(a => a.id === e.target.value);
                                            if (account) setSelectedAccount(account);
                                        }}
                                        className="w-full appearance-none bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                    >
                                        {accounts.map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.name} - {account.iban?.slice(-8)}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Toplam {accounts.length} hesap mevcut
                                </p>
                            </div>

                            {/* Selected Account Details */}
                            {selectedAccount && (
                                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 text-white">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{selectedAccount.name}</p>
                                            <p className="text-blue-200 text-sm font-mono">{selectedAccount.iban}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-blue-200 text-xs uppercase tracking-wider">Mevcut Bakiye</p>
                                            <p className="text-2xl font-bold">
                                                {showBalance ? formatCurrency(selectedAccount.balance) : '•••••••'}
                                            </p>
                                        </div>
                                        {cardCountByAccount[selectedAccount.id] !== undefined && cardCountByAccount[selectedAccount.id] > 0 && (
                                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                                                <CreditCard className="w-4 h-4" />
                                                <span className="text-sm">{cardCountByAccount[selectedAccount.id]} kart</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Two Column Layout: Transactions & Analysis Reports */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Transactions */}
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl">
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Son İşlemler</h3>
                                    {selectedAccount && (
                                        <p className="text-sm text-blue-400 mt-1">{selectedAccount.name}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => router.push('/transactions')}
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Tümünü Gör
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoadingTransactions ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">Henüz işlem bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.slice(0, 5).map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'INCOME'
                                                    ? 'bg-green-600'
                                                    : 'bg-red-600'
                                                    }`}>
                                                    {transaction.type === 'INCOME'
                                                        ? <ArrowUpRight className="w-5 h-5 text-white" />
                                                        : <ArrowDownLeft className="w-5 h-5 text-white" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{transaction.description}</p>
                                                    <p className="text-gray-400 text-sm">{transaction.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${transaction.type === 'INCOME'
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
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

                    {/* Analysis Reports Section */}
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl">
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-purple-400" />
                                    <h3 className="text-xl font-semibold text-white">Analiz Raporları</h3>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    disabled={isCreatingAnalysis}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Yeni Analiz
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoadingAnalysis ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                </div>
                            ) : analysisReports.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
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