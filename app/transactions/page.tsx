'use client';

import {useAuth} from '@/app/lib/hooks/useAuth';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import { useAlert } from "@/app/lib/hooks/useAlert";
import AlertBox from "@/components/modals/AlertBox";

import {
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    Eye,
    EyeOff,
    Landmark,
    RefreshCw,
    Send,
} from 'lucide-react';


import NotificationPanel from "@/app/components/atmui/NotificationPanel";
import ProtectedRoute from "@/app/lib/providers/ProtectedRoute"
import AccountCreationForm from "@/app/components/AccountCreationForm";

// Transaction tipi
interface Transaction {
    id: string;
    accountId: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    date: string; // ISO datetime
    category: string;
    channel: string;
    status: string;
}

interface Account {
    id: string;
    name: string;
    currency: string;
    iban: string;
    balance: number;
}

interface City {
    id: string;
    name: string;
}

interface District {
    id: string;
    name: string;
}

interface Branch {
    id: string;
    name: string;
    address: string;
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

export default function TransactionPage() {
    const router = useRouter();
    const {user, isAuthenticated, logout, checkAuth} = useAuth();
    const { alert, showAlert } = useAlert();

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [filterDate, setFilterDate] = useState<'ALL' | 'WEEK' | 'MONTH'>('ALL');

    const [showBalance, setShowBalance] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account>();

    const [cities, setCities] = useState<City[] | null>([]);
    const [districts, setDistricts] = useState<District[] | null>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [newAccount, setNewAccount] = useState(
        {name: "", iban: "", currency: "TRY", description: "", city: "", district: "", branchId: "", balance: 0});


    useEffect(() => {
        if (isAuthenticated) {
            Promise.all([fetchAccountData()]).finally(() => setIsLoading(false));
        }
    }, [isAuthenticated]);

    const fetchAccountData = async () => {
        try {
            console.log("Fetching accounts...");
            const res = await fetch('/api/account/list', {
                method: 'POST',
                credentials: "include"
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("❌ API error:", errorText);
                return;
            }

            const data = await res.json();
            setAccounts(data);

            if (data.length > 0 && !selectedAccount) {
                setSelectedAccount(data[0]);
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
    }, [selectedAccount, page, filterType, filterDate]);


    useEffect(() => {
        if (showAccountForm) {
            const fetchCities = async () => {
                try {
                    const response = await fetch('/api/city/list', {
                        method: 'GET',
                        credentials: "include"
                    })

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error("❌ API error:", errorText);
                        return;
                    }
                    const data = await response.json();
                    setCities(data);
                } catch (error) {
                    console.error("Cities fetch error", error);
                }
            }
            fetchCities();
        }
    }, [showAccountForm]);

    const fetchDistricts = async (city: string) => {
        try {
            const response = await fetch('/api/district/list?city=' + city, {
                method: 'GET',
                credentials: "include"
            });

            const data = await response.json();
            setDistricts(data);

        } catch (error) {
            console.log("❌ İlçeler alınamadı:", error);
        }
    }

    const fetchBranches = async (district: string) => {
        try {
            const response = await fetch('/api/branch/list?district=' + district, {
                method: 'GET',
                credentials: "include"
            });

            const data = await response.json();
            setBranches(data);
        } catch (error) {
            console.log("❌ Şubeler alınamadı:", error);
        }
    };

    const fetchTransactions = async () => {
        try {
            if (!selectedAccount) return;

            const response = await fetch('/api/account/transaction/list', {
                method: 'POST',
                credentials: "include",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    page,
                    size: 5,
                    accountId: selectedAccount.id,
                    type: filterType !== 'ALL' ? filterType : undefined,
                    dateRange: filterDate !== 'ALL' ? filterDate : undefined,
                }),
            });

            const data = await response.json();

            console.log("response transaction list page.tsx icerisinden deneme: ", data);
            if (!response.ok) {
                showAlert(
                    "error",
                    data.processCode || "İşlem Başarısız",
                    data.processMessage || "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."
                );
                return;
            }

            // Backend'in response'u Page<Transaction> formatında ise:
            setRecentTransactions(data.transactions || data);
            setTotalPages(data.totalPages || 1);
            showAlert("success", "İşlem Başarılı", "Veriler başarıyla yüklendi.");
        } catch (err) {
            console.error("Transactions fetch error:", err);
            showAlert("error", "Sunucu Hatası","Lütfen daha sonra tekrar deneyiniz.");
        }
    };


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };


    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        if (isLoading) {
            const timeout = setTimeout(() => {
                router.push("/");
            }, 5000);

            return () => clearTimeout(timeout); // Cleanup timeout on unmount
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4"/>
                    <p className="text-white">Hesap bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`/api/account/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({
                    name: newAccount.name,
                    description: newAccount.description,
                    currency: newAccount.currency,
                    branchId: newAccount.branchId,
                }),
            });

            // Başarılı olduğunda bildirim paneli veya modal göster
            setShowSuccess(true);
            setShowAccountForm(false);
            setNewAccount({
                name: "",
                iban: "",
                currency: "TRY",
                description: "",
                city: "",
                district: "",
                branchId: "",
                balance: 0,
            });

            // Hesapları yeniden yükle
            await fetchAccountData();

        } catch (error) {
            console.error("Account create error", error);
        }
    };

    //const savingsProgress = (accountData.currentSavings / accountData.savingsGoal) * 100;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <AlertBox type={alert.type} title={alert.title} message={alert.message} />

                {accounts.length === 0 && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md text-white">
                            <h2 className="text-2xl font-bold mb-4">Hesap Bulunamadı</h2>
                            <p className="text-gray-300 mb-6">
                                Henüz bir hesabınız bulunmuyor. Yeni bir hesap açmak ister misiniz?
                            </p>

                            {!showAccountForm && (
                                <div className="flex gap-3">
                                    {/* EVET */}
                                    <button
                                        onClick={() => setShowAccountForm(true)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                                    >
                                        Evet
                                    </button>

                                    {/* HAYIR */}
                                    <button
                                        onClick={() => router.push("/")}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
                                    >
                                        Hayır
                                    </button>
                                </div>
                            )}

                            {showSuccess && (
                                <div
                                    className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                                    <div
                                        className="bg-gray-900 border border-green-600 rounded-xl p-8 text-center text-white shadow-lg">
                                        <div className="flex justify-center mb-4">
                                            <svg
                                                className="w-16 h-16 text-green-500 animate-bounce"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Hesap Başarıyla Oluşturuldu!</h2>
                                        <p className="text-gray-400 mb-6">Yeni hesabınızı kontrol panelinizden
                                            görüntüleyebilirsiniz.</p>
                                        <button
                                            onClick={() => setShowSuccess(false)}
                                            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold"
                                        >
                                            Tamam
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Eğer EVET derse form açılacak */}
                            {showAccountForm && (
                                <AccountCreationForm
                                    newAccount={newAccount}
                                    setNewAccount={setNewAccount}
                                    cities={cities}
                                    districts={districts}
                                    branches={branches}
                                    onSubmit={handleCreateAccount}
                                    onCityChange={fetchDistricts}
                                    onDistrictChange={fetchBranches}
                                />
                            )}
                        </div>
                    </div>
                )}


                {/* Header */}
                <header className="bg-black/50 backdrop-blur-md border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.push('/')}
                                    className="group flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <Landmark
                                        className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors"/>
                                    <span
                                        className="ml-2 text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">BAKIRBANK</span>
                                </button>
                                <span className="text-2xl font-bold text-white">İşlemler</span>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span
                                    className="text-gray-300">Hoş geldin, {user?.firstName} {user?.secondName} {user?.lastName}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </div>
                    <NotificationPanel userId={user?.id ?? "null"}/>
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
                                            <EyeOff className="w-5 h-5"/>
                                        ) : (
                                            <Eye className="w-5 h-5"/>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <Wallet className="w-8 h-8 opacity-80"/>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                                <Send className="w-4 h-4"/>
                                <span>Para Gönder</span>
                            </button>
                            <button
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                                <ArrowDownLeft className="w-4 h-4"/>
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

                        {/* Filtreler */}
                        <div className="flex flex-wrap justify-between items-center mb-4">
                            {/* Tarih Filtreleri */}
                            <div className="flex gap-2">
                                {['ALL', 'WEEK', 'MONTH'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => {
                                            setFilterDate(range as any);
                                            setPage(0);
                                        }}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors mt-4 ml-2 ${ //TODO: En son buradaydim.
                                            filterDate === range
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        }`}
                                    >
                                        {range === 'ALL' ? 'Tümü' : range === 'WEEK' ? 'Son 1 Hafta' : 'Son 1 Ay'}
                                    </button>
                                ))}
                            </div>

                            {/* Tür Filtreleri */}
                            <div className="flex gap-2">
                                {['ALL', 'INCOME', 'EXPENSE'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setFilterType(type as any);
                                            setPage(0);
                                        }}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                            filterType === type
                                                ? (type === 'INCOME'
                                                    ? "bg-green-600 text-white"
                                                    : type === 'EXPENSE'
                                                        ? "bg-red-600 text-white"
                                                        : "bg-blue-600 text-white")
                                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        }`}
                                    >
                                        {type === 'ALL' ? 'Tümü' : type === 'INCOME' ? 'Gelirler' : 'Giderler'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6" style={{ minHeight: '600px' }}>
                            <div  className="space-y-4 overflow-y-auto max-h-120">
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
                                                    <ArrowUpRight className="w-5 h-5 text-white"/>
                                                ) : (
                                                    <ArrowDownLeft className="w-5 h-5 text-white"/>
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

                            <div className="flex justify-center items-center mt-6 space-x-4">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                                    disabled={page === 0}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600"
                                >
                                    Previous
                                </button>

                                <span className="text-gray-300">
        Page {page + 1} of {totalPages}
    </span>

                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                                    disabled={page >= totalPages - 1}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}