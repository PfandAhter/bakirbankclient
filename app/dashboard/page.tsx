'use client';

import { useAuth } from '@/app/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Eye,
    EyeOff,
    Landmark,
    RefreshCw,
    Send,
    PiggyBank
} from 'lucide-react';
import axios from 'axios';

import NotificationPanel from "@/app/components/atmui/NotificationPanel";

interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    date: string;
    category: string;
}

interface AccountData {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsGoal: number;
    currentSavings: number;
}

export default function DashboardPage() {
    const { user, isAuthenticated, checkAuth, logout } = useAuth();
    const router = useRouter();
    const [showBalance, setShowBalance] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`http://localhost:8090/api/v1/dashboard`, {
                params: { userId: user?.id }
            });

            // API'den gelen data'yı set et
            const { account, transactions } = res.data;

            setAccountData(account);
            setRecentTransactions(transactions);
        } catch (err) {
            console.error("Dashboard veri çekme hatası:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchDashboardData();
    }, [user, isAuthenticated]);

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

    if (isLoading || !accountData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">Hesap bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    const savingsProgress = (accountData.currentSavings / accountData.savingsGoal) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Header */}
            <header className="bg-black/50 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/')}
                                className="group flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <Landmark className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors"/>
                                <span className="ml-2 text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">BAKIRBANK</span>
                            </button>
                            <span className="text-2xl font-bold text-white">Dashboard</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-gray-300">Hoş geldin, {user?.username || "Kullanıcı"}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
                <NotificationPanel userId={user?.id || ""} />
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 mb-8 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-medium opacity-90">Toplam Bakiye</h2>
                            <div className="flex items-center space-x-3 mt-2">
                                <p className="text-4xl font-bold">
                                    {showBalance ? formatCurrency(accountData.balance) : '••••••••'}
                                </p>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <Wallet className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                            <Send className="w-4 h-4" />
                            <span>Para Gönder</span>
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                            <ArrowDownLeft className="w-4 h-4" />
                            <span>Para Yatır</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Monthly Income */}
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Aylık Gelir</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {formatCurrency(accountData.monthlyIncome)}
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
                                <p className="text-gray-400 text-sm">Aylık Gider</p>
                                <p className="text-2xl font-bold text-red-400">
                                    {formatCurrency(accountData.monthlyExpenses)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Total Income */}
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Toplam Gelir</p>
                                <p className="text-2xl font-bold text-blue-400">
                                    {formatCurrency(accountData.totalIncome)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Savings Progress */}
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-gray-400 text-sm">Birikim Hedefi</p>
                                <p className="text-2xl font-bold text-purple-400">
                                    %{Math.round(savingsProgress)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <PiggyBank className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {formatCurrency(accountData.currentSavings)} / {formatCurrency(accountData.savingsGoal)}
                        </p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl">
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Son İşlemler</h3>
                            <button
                                onClick={() => router.push('/transactions')}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Tümünü Gör
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {recentTransactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            transaction.type === 'INCOME'
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
                                        <p className={`font-bold ${
                                            transaction.type === 'INCOME'
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
                    </div>
                </div>
            </div>
        </div>
    );
}
