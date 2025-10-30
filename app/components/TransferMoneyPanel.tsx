'use client';

import React, {useEffect, useState} from "react";
import {
    X,
    Send,
    RefreshCw,
    CreditCard,
    Building2,
    DollarSign,
    FileText,
    CheckCircle2
} from "lucide-react";
import {useAlert} from "@/app/lib/hooks/useAlert";
import AlertBox from "@/components/modals/AlertBox";

interface Account {
    id: string;
    name: string;
    currency: string;
    iban: string;
    balance: number;
}

interface SavedRecipient {
    id: string;
    nickname: string;
    accountIBAN: string;
    firstName: string;
    secondName?: string;
    lastName: string;
}

interface TransferMoneyPanelProps {
    fromAccounts: Account[];
    selectedAccount?: Account;
    selectedSavedRecipient?: SavedRecipient | null;
    onClose: () => void;
    onSuccess: () => Promise<void>;
}

const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
    GOLD: "🥇",
};

export default function TransferMoneyPanel({
                                               fromAccounts,
                                               selectedAccount,
                                               selectedSavedRecipient,
                                               onClose,
                                               onSuccess,
                                           }: TransferMoneyPanelProps) {
    const {alert, showAlert} = useAlert();

    const [formData, setFormData] = useState({
        fromAccountId: selectedAccount?.id,
        toIban: "",
        amount: "",
        description: "",
        recipientNameConfirm: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [recipientName, setRecipientName] = useState<string | null>(null);
    const [ibanLoading, setIbanLoading] = useState(false);
    const [nameMatch, setNameMatch] = useState<boolean | null>(null);

    useEffect(() => {
        if (selectedSavedRecipient) {
            setFormData(prev => ({
                ...prev,
                toIban: selectedSavedRecipient.accountIBAN,
                recipientNameConfirm: `${selectedSavedRecipient.firstName}${selectedSavedRecipient.lastName ? ' ' + selectedSavedRecipient.lastName : ''}`
            }));

            const fullName = [selectedSavedRecipient.firstName, selectedSavedRecipient.secondName, selectedSavedRecipient.lastName]
                .filter(Boolean)
                .join(' ');
            setRecipientName(fullName || null);
            setNameMatch(fullName ? true : null);
        }
    }, [selectedSavedRecipient]);

    // --- Yeni yardımcı fonksiyonlar ---
    const maskName = (name: string): string => {
        const parts = name.split(" ");
        return parts
            .map((part) =>
                part.length > 2
                    ? part[0] + "*".repeat(part.length - 1)
                    : part[0] + "*"
            )
            .join(" ");
    };

    const fetchRecipientName = async (iban: string) => {
        if (iban.length < 26) {
            setRecipientName(null);
            return;
        }

        setIbanLoading(true);
        try {
            const res = await fetch(`/api/account/get-name-by-iban?iban=${encodeURIComponent(iban)}`, {
                method: "GET",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
            });

            const data = await res.json();

            if (res.ok && data.firstName) {
                let fullName = `${data.firstName} ${data.secondName ?? ""} ${data.lastName ?? ""}`.trim();
                if (data.secondName === null || data.secondName === undefined || data.secondName === "") {
                    fullName = `${data.firstName} ${data.lastName}`.trim();
                }
                setRecipientName(fullName);
                showAlert("info", "Alıcı Bulundu", "IBAN sahibinin adı başarıyla getirildi.");
            } else {
                setRecipientName(null);
                showAlert("warning", "Uyarı", "IBAN'a ait kullanıcı bulunamadı.");
            }
        } catch (error) {
            console.error("IBAN lookup error:", error);
            showAlert("error", "Hata", "IBAN sorgulaması başarısız oldu.");
        } finally {
            setIbanLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});

        // IBAN değiştiğinde isim sorgula
        if (name === "toIban") {
            if (value.replace(/\s/g, "").length === 26) {
                fetchRecipientName(value);
            } else {
                setRecipientName(null);
                setNameMatch(null);
            }
        }

        // Alıcı onayı yazıldıkça kontrol et
        if (name === "recipientNameConfirm" && recipientName) {
            const confirmVal = value.trim().toLowerCase();
            const realName = recipientName.trim().toLowerCase();
            const realSurname = realName.split(" ").slice(-1)[0];

            const isExactMatch = confirmVal === realName;
            const isAllWordsMatch =
                confirmVal.length > 0 &&
                confirmVal.split(/\s+/).every((w) => realName.includes(w));
            const isSurnameMatch = realSurname.startsWith(confirmVal);

            if (confirmVal && (isExactMatch || isAllWordsMatch || isSurnameMatch)) {
                setNameMatch(true);
            } else {
                setNameMatch(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fromAccountId || !formData.toIban || !formData.amount) {
            showAlert("error", "Eksik Bilgi", "Lütfen tüm zorunlu alanları doldurun.");
            return;
        }

        if (recipientName && !nameMatch) {
            showAlert("warning", "Doğrulama Gerekli", "Lütfen alıcının ismini doğrulayın.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/account/transaction/transfer", {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    fromAccountId: formData.fromAccountId,
                    toIban: formData.toIban,
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                showAlert("error", data.processCode || "İşlem Başarısız", data.processMessage || "Transfer gerçekleştirilemedi.");
                return;
            }

            showAlert("success", "İşlem Başarılı", "Para transferi başarıyla tamamlandı.");
            setSuccess(true);
            await onSuccess();
        } catch (error) {
            console.error("Transfer error:", error);
            showAlert("error", "Sunucu Hatası", "Lütfen daha sonra tekrar deneyiniz.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <AlertBox type={alert.type} title={alert.title} message={alert.message}/>

            <div className="bg-[#0c0d13] border border-[#1e222d] rounded-2xl shadow-2xl w-full max-w-lg text-white">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-[#1e222d] p-6">
                    <div className="flex items-center space-x-3">
                        <div
                            className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                            <Send className="w-5 h-5 text-white"/>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Para Transferi</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-[#1e293b] p-2 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {/* Success */}
                {success ? (
                    <div className="p-8 text-center">
                        <div
                            className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-12 h-12 text-green-500 animate-pulse"/>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Transfer Başarılı!</h2>
                        <p className="text-gray-400 mb-6">Para transferiniz başarıyla tamamlandı.</p>
                        <button
                            onClick={onClose}
                            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg"
                        >
                            Tamam
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Kaynak Hesap */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300 mb-2">
                                <CreditCard className="w-4 h-4 text-blue-400"/>
                                <span>Kaynak Hesap</span>
                            </label>
                            <select
                                name="fromAccountId"
                                value={formData.fromAccountId}
                                onChange={handleChange}
                                className="w-full bg-[#1e293b] border border-[#1e222d] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">Hesap Seçiniz</option>
                                {fromAccounts.map((acc) => (
                                    <option key={acc.id} value={acc.id} className="bg-[#1e293b]">
                                        {acc.name} • {acc.iban.slice(-8)} • {currencySymbols[acc.currency]}
                                        {acc.balance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* IBAN */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300 mb-2">
                                <Building2 className="w-4 h-4 text-blue-400"/>
                                <span>Alıcı IBAN</span>
                            </label>
                            <input
                                type="text"
                                name="toIban"
                                value={formData.toIban}
                                onChange={handleChange}
                                placeholder="TR00 0000 0000 0000 0000 0000 00"
                                maxLength={32}
                                className="w-full bg-[#1e293b] border border-[#1e222d] text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
                            />
                            {/* Hashli isim gösterimi */}
                            {ibanLoading && (
                                <p className="text-xs text-gray-400 mt-2 animate-pulse">
                                    IBAN kontrol ediliyor...
                                </p>
                            )}
                            {recipientName && (
                                <div
                                    className="mt-2 bg-[#111827]/70 border border-[#1e222d] rounded-lg p-2 text-xs text-gray-300">
                                    Alıcı Adı:{" "}
                                    <span className="text-blue-400 font-semibold">
                                        {maskName(recipientName)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Alıcı Onayı */}
                        {recipientName && (
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400"/>
                                    <span>Alıcının Adını ve Soyadını Girin</span>
                                </label>
                                <input
                                    type="text"
                                    name="recipientNameConfirm"
                                    value={formData.recipientNameConfirm}
                                    onChange={handleChange}
                                    placeholder="Adını ve Soyadını giriniz"
                                    className={`w-full bg-[#1e293b] border px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                                        nameMatch === false
                                            ? "border-red-600"
                                            : nameMatch
                                                ? "border-green-600"
                                                : "border-[#1e222d]"
                                    }`}
                                />
                                {nameMatch === false && (
                                    <p className="text-red-500 text-xs mt-1">
                                        Girilen isim, IBAN sahibinin ismiyle uyuşmuyor.
                                    </p>
                                )}
                                {nameMatch && (
                                    <p className="text-green-500 text-xs mt-1">
                                        Alıcı ismi doğrulandı ✅
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Tutar */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300 mb-2">
                                <DollarSign className="w-4 h-4 text-blue-400"/>
                                <span>Tutar</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="amount"
                                    min="1"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-[#1e293b] border border-[#1e222d] text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                    {selectedAccount ? currencySymbols[selectedAccount.currency] : "₺"}
                                </span>
                            </div>
                        </div>

                        {/* Açıklama */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300 mb-2">
                                <FileText className="w-4 h-4 text-blue-400"/>
                                <span>Açıklama (Opsiyonel)</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Transfer açıklaması ekleyin..."
                                className="w-full bg-[#1e293b] border border-[#1e222d] text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-[#1e293b] hover:bg-[#334155] text-white px-6 py-3 rounded-lg font-semibold text-sm"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (recipientName && !nameMatch)}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm shadow-lg transition-all ${
                                    loading || (recipientName && !nameMatch)
                                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin"/>
                                        <span>Gönderiliyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4"/>
                                        <span>Gönder</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
