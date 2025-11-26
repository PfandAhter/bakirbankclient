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
    ChevronDown,
    CreditCard,
    FileText,
    Clock,
    Download,
} from 'lucide-react';


import NotificationPanel from "@/app/components/atmui/NotificationPanel";
import ProtectedRoute from "@/app/lib/providers/ProtectedRoute"
import AccountCreationForm from "@/app/components/AccountCreationForm";
import TransferMoneyPanel from "@/app/components/TransferMoneyPanel";
import SavedRecipientShowModal from "@/app/components/SavedRecipientShowModal";

// Transaction tipi
interface Transaction {
    id: string;
    accountId: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    date: string;
    category: string;
    channel: string;
    status: string;
    invoiceStatus?: 'PENDING' | 'COMPLETED' | null;
}

interface SavedRecipient {
    id: string;
    nickname: string;
    accountIBAN: string;
    firstName: string;
    secondName?: string;
    lastName: string;
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
    GOLD: "🥇",
};

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

    const [showTransferPanel, setShowTransferPanel] = useState(false);
    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<SavedRecipient | null>(null);
    const [showRecipientForm, setShowRecipientForm] = useState(false);

    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account>();
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);

    const [cities, setCities] = useState<City[] | null>([]);
    const [districts, setDistricts] = useState<District[] | null>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [newAccount, setNewAccount] = useState(
        {name: "", iban: "", currency: "TRY", description: "", city: "", district: "", branchId: "", balance: 0});

    const [loadingInvoices, setLoadingInvoices] = useState<Record<string, boolean>>({});


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

        } catch (err) {
            console.error("Account fetch error:", err);
        }
    };

    useEffect(() => {
        fetchSavedRecipients();
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            fetchTransactions();
        }
    }, [selectedAccount, page, filterType, filterDate]);

    const fetchSavedRecipients = async () => {
        try {
            const res = await fetch("/api/account/saved/list", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) throw new Error("Kayıtlı alıcılar alınamadı.");
            setSavedRecipients(data);
        } catch (err) {
            console.error("❌ fetchSavedRecipients:", err);
        }
    };

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

            if (!response.ok) {
                showAlert(
                    "error",
                    data.processCode || "İşlem Başarısız",
                    data.processMessage || "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."
                );
                return;
            }

            setRecentTransactions(data.transactions || data);
            setTotalPages(data.totalPages || 1);
            showAlert("success", "İşlem Başarılı", "Veriler başarıyla yüklendi.");
        } catch (err) {
            console.error("Transactions fetch error:", err);
            showAlert("error", "Sunucu Hatası","Lütfen daha sonra tekrar deneyiniz.");
        }
    };

    const handleInvoiceClick = async (transactionId: string, invoiceStatus: string) => {
        setLoadingInvoices(prev => ({ ...prev, [transactionId]: true }));

        try {
            const response = await fetch('/api/invoice/get', {
                method: 'POST',
                credentials: "include",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ transactionId }),
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert(
                    "error",
                    data.processCode || "İşlem Başarısız",
                    data.processMessage || "Dekont alınamadı."
                );
                return;
            }

            if (data.status === 'PENDING') {
                showAlert(
                    "info",
                    "Dekont Hazırlanıyor",
                    data.message || `Dekont oluşturma işlemi devam ediyor. Kalan süre: ${data.remainingTime || 'Bilinmiyor'}`
                );
            } else if (data.status === 'COMPLETED') {
                // PDF byte array'i base64 formatında geldiğini varsayıyoruz
                const pdfBlob = base64ToBlob(data, 'application/pdf');
                const pdfUrl = URL.createObjectURL(pdfBlob);

                // Yeni sekmede PDF'i aç
                window.open(pdfUrl, '_blank');

                showAlert(
                    "success",
                    "Dekont Hazır",
                    "Dekontunuz yeni sekmede açıldı."
                );

                // Transaction listesini güncelle
                setRecentTransactions(prev =>
                    prev.map(t =>
                        t.id === transactionId
                            ? { ...t, invoiceStatus: 'COMPLETED' as const }
                            : t
                    )
                );
            }else{
                // PDF byte array'i base64 formatında geldiğini varsayıyoruz
                const pdfBlob = base64ToBlob(data, 'application/pdf');
                const pdfUrl = URL.createObjectURL(pdfBlob);

                // Yeni sekmede PDF'i aç
                window.open(pdfUrl, '_blank');

                showAlert(
                    "success",
                    "Dekont Hazır",
                    "Dekontunuz yeni sekmede açıldı."
                );

                // Transaction listesini güncelle
                setRecentTransactions(prev =>
                    prev.map(t =>
                        t.id === transactionId
                            ? { ...t, invoiceStatus: 'COMPLETED' as const }
                            : t
                    )
                );
            }
        } catch (err) {
            console.error("Invoice fetch error:", err);
            showAlert("error", "Sunucu Hatası", "Dekont alınırken bir hata oluştu.");
        } finally {
            setLoadingInvoices(prev => ({ ...prev, [transactionId]: false }));
        }
    };

    const base64ToBlob = (base64: string, contentType: string): Blob => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: contentType });
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

            return () => clearTimeout(timeout);
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4"/>
                    <p className="text-gray-300 text-base font-normal tracking-wide">Hesap bilgileri yükleniyor...</p>
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

            await fetchAccountData();

        } catch (error) {
            console.error("Account create error", error);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0a0b0f] text-[#f8fafc]">
                <AlertBox type={alert.type} title={alert.title} message={alert.message} />

                {accounts.length === 0 && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-[#0c0d13] border border-[#1e222d] rounded-xl shadow-xl p-8 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4 text-white tracking-tight">Hesap Bulunamadı</h2>
                            <p className="text-gray-400 mb-6 font-normal">
                                Henüz bir hesabınız bulunmuyor. Yeni bir hesap açmak ister misiniz?
                            </p>

                            {!showAccountForm && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowAccountForm(true)}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 px-4 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all"
                                    >
                                        Evet
                                    </button>
                                    <button
                                        onClick={() => router.push("/")}
                                        className="flex-1 bg-[#1e293b] hover:bg-[#334155] px-4 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all"
                                    >
                                        Hayır
                                    </button>
                                </div>
                            )}

                            {showSuccess && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                                    <div className="bg-[#0c0d13] border border-green-600 rounded-xl p-8 text-center shadow-lg">
                                        <div className="flex justify-center mb-4">
                                            <svg
                                                className="w-16 h-16 text-green-500 animate-bounce"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2 text-white tracking-tight">Hesap Başarıyla Oluşturuldu!</h2>
                                        <p className="text-gray-400 mb-6 font-normal">Yeni hesabınızı kontrol panelinizden görüntüleyebilirsiniz.</p>
                                        <button
                                            onClick={() => setShowSuccess(false)}
                                            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all"
                                        >
                                            Tamam
                                        </button>
                                    </div>
                                </div>
                            )}

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
                <header className="bg-[#0c0d13]/80 border-b border-[#1e222d] backdrop-blur-lg">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => router.push('/')}
                                    className="group flex items-center transition-all"
                                >
                                    <Landmark className="h-7 w-7 text-blue-400 group-hover:text-blue-300 transition-colors"/>
                                    <span className="ml-2 text-2xl font-bold text-white group-hover:text-blue-300 transition-colors tracking-tight" style={{ transform: 'scaleY(1.3)', transformOrigin: 'center' }}>
                                        BAKIRBANK
                                    </span>
                                </button>
                                <span className="text-gray-600">|</span>
                                <span className="text-xl font-semibold text-white tracking-tight">İşlemler</span>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-gray-400 text-sm font-normal">
                                    Hoş geldin, <span className="text-white font-semibold">{user?.firstName} {user?.lastName}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-[#7f1d1d] hover:bg-[#991b1b] text-white px-4 py-2 rounded-lg font-medium text-sm tracking-wide transition-all"
                                >
                                    Çıkış Yap
                                </button>
                                <NotificationPanel userId={user?.id ?? "null"}/>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <SavedRecipientShowModal onRecipientSelect={setSelectedRecipient}
                                             showRecipientForm={showRecipientForm}
                                             setShowRecipientForm={setShowRecipientForm}
                                             setShowTransferPanel={setShowTransferPanel}
                    >
                    </SavedRecipientShowModal>

                    <div className="mb-8 relative">
                        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#1e222d] rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                                        <CreditCard className="w-7 h-7 text-white"/>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm font-normal mb-1">Aktif Hesap</p>
                                        <button
                                            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                                            className="flex items-center space-x-2 group"
                                        >
                                            <span className="text-xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                                                {selectedAccount?.name}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-all ${showAccountDropdown ? 'rotate-180' : ''}`}/>
                                        </button>
                                        <p className="text-gray-500 text-xs font-normal mt-1">{selectedAccount?.iban}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-gray-400 text-sm font-normal mb-1">Güncel Bakiye</p>
                                    <div className="flex items-center space-x-2 justify-end">
                                        <p className="text-2xl font-bold text-white tracking-tight">
                                            {showBalance
                                                ? formatCurrency(selectedAccount?.balance ?? 0)
                                                : "••••••••"}
                                        </p>
                                        <button
                                            onClick={() => setShowBalance(!showBalance)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            {showBalance ? (
                                                <Eye className="w-4 h-4 text-gray-400"/>
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-gray-400"/>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {showAccountDropdown && (
                                <div className="mt-4 pt-4 border-t border-[#1e222d] space-y-2">
                                    {accounts.map((acc) => (
                                        <button
                                            key={acc.id}
                                            onClick={() => {
                                                setSelectedAccount(acc);
                                                setShowAccountDropdown(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg transition-all ${
                                                selectedAccount?.id === acc.id
                                                    ? 'bg-blue-600/20 border border-blue-600/50'
                                                    : 'bg-[#0f172a] hover:bg-[#1e293b] border border-transparent'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-white font-semibold text-sm tracking-tight">{acc.name}</p>
                                                    <p className="text-gray-500 text-xs font-normal">{acc.iban}</p>
                                                </div>
                                                <p className="text-white font-bold text-sm">
                                                    {currencySymbols[acc.currency]} {acc.balance.toLocaleString()}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Balance Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 mb-8 shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-semibold opacity-90 tracking-wide">Toplam Bakiye</h2>
                                <div className="flex items-center space-x-3 mt-2">
                                    <p className="text-4xl font-bold tracking-tight">
                                        {showBalance
                                            ? formatCurrency(selectedAccount?.balance ?? 0)
                                            : "••••••••"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Wallet className="w-8 h-8 opacity-80"/>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowTransferPanel(true)}
                                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-all flex items-center space-x-2 font-semibold text-sm tracking-wide shadow-lg"
                            >
                                <Send className="w-4 h-4"/>
                                <span>Para Gönder</span>
                            </button>
                            {showTransferPanel && (
                                <TransferMoneyPanel
                                    fetchTransaction={fetchTransactions}
                                    fromAccounts={accounts}
                                    selectedAccount={selectedAccount}
                                    selectedSavedRecipient={selectedRecipient}
                                    onClose={() => setShowTransferPanel(false)}
                                    onSuccess={fetchAccountData}
                                />
                            )}
                            <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-all flex items-center space-x-2 font-semibold text-sm tracking-wide shadow-lg">
                                <ArrowDownLeft className="w-4 h-4"/>
                                <span>Para Yatır</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-[#0c0d13]/50 backdrop-blur-md border border-[#1e222d] rounded-2xl shadow-xl">
                        <div className="p-6 border-b border-[#1e222d]">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white tracking-tight">Son İşlemler</h3>
                                <button
                                    onClick={() => router.push("/transactions")}
                                    className="text-blue-400 hover:text-blue-300 transition-colors font-semibold text-sm tracking-wide"
                                >
                                    Tümünü Gör
                                </button>
                            </div>
                        </div>

                        {/* Filtreler */}
                        <div className="px-6 py-4 border-b border-[#1e222d]">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                {/* Tarih Filtreleri */}
                                <div className="flex gap-2">
                                    {['ALL', 'WEEK', 'MONTH'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => {
                                                setFilterDate(range as any);
                                                setPage(0);
                                            }}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all tracking-wide ${
                                                filterDate === range
                                                    ? "bg-blue-600 text-white shadow-lg"
                                                    : "bg-[#1e293b] text-gray-300 hover:bg-[#334155]"
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
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all tracking-wide ${
                                                filterType === type
                                                    ? (type === 'INCOME'
                                                        ? "bg-green-600 text-white shadow-lg"
                                                        : type === 'EXPENSE'
                                                            ? "bg-red-600 text-white shadow-lg"
                                                            : "bg-blue-600 text-white shadow-lg")
                                                    : "bg-[#1e293b] text-gray-300 hover:bg-[#334155]"
                                            }`}
                                        >
                                            {type === 'ALL' ? 'Tümü' : type === 'INCOME' ? 'Gelirler' : 'Giderler'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6" style={{ minHeight: '600px' }}>
                            <div className="space-y-3 overflow-y-auto max-h-120">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 bg-[#1e293b]/30 rounded-xl hover:bg-[#1e293b]/50 transition-all border border-transparent hover:border-[#1e222d]"
                                    >
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                                    transaction.type === "INCOME"
                                                        ? "bg-green-600"
                                                        : "bg-red-600"
                                                }`}
                                            >
                                                {transaction.type === "INCOME" ? (
                                                    <ArrowUpRight className="w-6 h-6 text-white"/>
                                                ) : (
                                                    <ArrowDownLeft className="w-6 h-6 text-white"/>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-semibold text-base tracking-tight">
                                                    {transaction.description}
                                                </p>
                                                <p className="text-gray-500 text-xs font-normal mt-1">
                                                    {transaction.category}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Invoice Button */}
                                            {(() => {
                                                const status = (transaction.invoiceStatus ?? '').toString().toUpperCase();
                                                if (!(status === 'COMPLETED' || status === 'PENDING')) return null;

                                                const isPending = status === 'PENDING';
                                                const isCompleted = status === 'COMPLETED';
                                                const loading = !!loadingInvoices[transaction.id];

                                                return (
                                                    <button
                                                        onClick={() => handleInvoiceClick(transaction.id, status)}
                                                        disabled={loading || isPending}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all ${
                                                            isCompleted
                                                                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/50'
                                                                : 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-600/50'
                                                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {loading ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                        ) : isCompleted ? (
                                                            <>
                                                                <Download className="w-4 h-4" />
                                                                <span>Dekont İndir</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-4 h-4" />
                                                                <span>Dekont Hazırlanıyor</span>
                                                            </>
                                                        )}
                                                    </button>
                                                );
                                            })()}

                                            <div className="text-right">
                                                <p
                                                    className={`font-bold text-lg tracking-tight ${
                                                        transaction.type === "INCOME"
                                                            ? "text-green-400"
                                                            : "text-red-400"
                                                    }`}
                                                >
                                                    {transaction.type === "INCOME" ? "+" : "-"}
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap font-normal">
                                                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                                    <span>{new Date(transaction.date).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center items-center mt-6 space-x-4">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                                    disabled={page === 0}
                                    className="px-5 py-2 bg-[#1e293b] text-white rounded-lg disabled:opacity-50 hover:bg-[#334155] transition-all font-semibold text-sm tracking-wide"
                                >
                                    Önceki
                                </button>

                                <span className="text-gray-400 font-medium text-sm">
                                    Sayfa {page + 1} / {totalPages}
                                </span>

                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                                    disabled={page >= totalPages - 1}
                                    className="px-5 py-2 bg-[#1e293b] text-white rounded-lg disabled:opacity-50 hover:bg-[#334155] transition-all font-semibold text-sm tracking-wide"
                                >
                                    Sonraki
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}