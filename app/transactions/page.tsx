'use client';

import { useAuth } from '@/app/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
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


import NotificationPanel from "@/app/components/atmui/NotificationPanel";

// Transaction tipi
interface Transaction {
    id: string;
    accountId:string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    date: string; // ISO datetime
    category: string;
    channel:string;
    status:string;
}

interface Account {
    id: string;
    name: string;
    currency: string;
    iban: string;
    balance: number;
}

const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
    GOLD: "🥇", // altın için emoji
};

// Account tipi
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
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [showBalance, setShowBalance] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account>();

    // ➡️ API’den veri çekme
    const fetchAccountData = async () => {
        try {
            /*const response = await axios.get("http://localhost:8081/api/v1/account/get", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });*/

            console.log("Fetching accounts...");
            const response = await axios.post("http://localhost:8081/api/v1/account/get", {
                token: "test"
            });

            const data = response.data;

            if (data.accounts && data.accounts.length > 0) {
                setAccounts(data.accounts);
                setSelectedAccount(data.accounts[0]);

            }else {
                console.warn("Accounts boş geldi!");
            }

            // Hesap özet bilgisi (eğer backend böyle bir endpoint sağlıyorsa)
            /*const summaryResponse = await axios.get("http://localhost:8081/api/v1/account/summary", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });*/
            // setAccountData(summaryResponse.data);

        } catch (err) {
            console.error("Account fetch error:", err);
        }
    };

    useEffect(() => {
        if (selectedAccount) {
            fetchTransactions();
        }
    }, [selectedAccount]);


    const fetchTransactions = async () => {
        try {
            console.log("selectedAccount:", selectedAccount);
            if (!selectedAccount) return;

            const res = await axios.get("http://localhost:8082/api/v1/transaction/transactions", {
                params: {
                    accountId: selectedAccount.id,
                    page: 0,
                    size: 5
                }
            });

            // Eğer Spring Page dönüyorsa:
            const pageData = res.data;

            console.log("Response data from transactions,", res);

            setRecentTransactions(pageData.transactions);
            setIsLoading(false);
            console.log("Is loading,", isLoading);

        } catch (err) {
            console.error("Transactions fetch error:", err);
        }
    };


    useEffect(() => {
        console.log("isAuthenticated changed:", isAuthenticated);
        if (isAuthenticated) {
            Promise.all([fetchAccountData()]).finally(() => setIsLoading(false));
        }
    }, [isAuthenticated]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    // ➡️ Hem tarih hem saat
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    //const savingsProgress = (accountData.currentSavings / accountData.savingsGoal) * 100;

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
                            <span className="text-gray-300">Hoş geldin, TEST_USERNAME</span> {/* {user?.username}*/}
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
                <NotificationPanel userId={user?.id ?? "TEST"} />
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Account Selector */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Hesap Seç</label>
                        <select
                            value={selectedAccount?.id || ""}
                            onChange={(e) => {
                                const acc = accounts.find((a) => a.id === e.target.value);
                                if (acc) {
                                    setSelectedAccount(acc);
                                }
                            }}
                            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name} ({currencySymbols[acc.currency] || acc.currency})
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedAccount && (
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Seçili Hesap Bakiyesi</p>
                            <p className="text-lg font-bold text-white">
                                {currencySymbols[selectedAccount.currency] || ""}{" "}
                                {selectedAccount.balance.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 mb-8 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-medium opacity-90">Toplam Bakiye</h2>
                            <div className="flex items-center space-x-3 mt-2">
                                <p className="text-4xl font-bold">
                                    {showBalance
                                        ? formatCurrency(selectedAccount?.balance ?? 0)
                                        : "••••••••"}
                                </p>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    {showBalance ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
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

                {/* Recent Transactions */}
                <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl">
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Son İşlemler</h3>
                            <button
                                onClick={() => router.push("/transactions")}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Tümünü Gör
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {recentTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                transaction.type === "INCOME"
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                            }`}
                                        >
                                            {transaction.type === "INCOME" ? (
                                                <ArrowUpRight className="w-5 h-5 text-white" />
                                            ) : (
                                                <ArrowDownLeft className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">
                                                {transaction.description}
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                {transaction.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`font-bold ${
                                                transaction.type === "INCOME"
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                            }`}
                                        >
                                            {transaction.type === "INCOME" ? "+" : "-"}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                        <div
                                            className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
                                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                            <span>{new Date(transaction.date).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </div>
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