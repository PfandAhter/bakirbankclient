"use client";

import React, { useState, useEffect } from "react";
import { useAccounts } from "@/src/hooks/useAccounts";
import { useTransactions } from "@/src/hooks/useTransaction";
import { useNotify } from "@/src/hooks/notification/useNotify";
import {
    X,
    CreditCard,
    User,
    Banknote,
    FileText,
    Send,
    ChevronDown,
    Loader2
} from "lucide-react";

interface Atm {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    status: string;
    depositStatus: string;
    withdrawStatus: string;
    supportedBanks?: Array<{
        id: string;
        name: string;
    }>;
    isUserCreated?: boolean;
}

interface AtmPanelProps {
    isOpen: boolean;
    togglePanel: () => void;
    selectedAtm: Atm | null;
    isAuthenticated: boolean;
}

const AtmPanel: React.FC<AtmPanelProps> = ({ isOpen, togglePanel, selectedAtm, isAuthenticated }) => {
    const notify = useNotify();

    const {
        accounts,
        selectedAccount,
        setSelectedAccount,
        isLoading: isAccountsLoading
    } = useAccounts(isAuthenticated);

    useEffect(() => {
        if (!isAccountsLoading && accounts && accounts.length > 0 && !selectedAccount) {
            setSelectedAccount(accounts[0]);
        }
    }, [accounts, isAccountsLoading, selectedAccount, setSelectedAccount]);

    const showAlert = (type: string, title: string, message: string) => {
        if (type === "error") {
            notify.error(title, message);
        } else if (type === "warning") {
            notify.warning(title, message);
        } else if (type === "info") {
            notify.info(title, message);
        } else {
            notify.success(title, message);
        }
    };

    const { atmTransfer, fetchRecipientByIban, isTransferLoading, isIbanLoading } = useTransactions({
        selectedAccountId: selectedAccount?.iban,
        showAlert
    });

    const [identifier, setIdentifier] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [namePreview, setNamePreview] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [isIbanMode, setIsIbanMode] = useState(false);
    const [ibanNotFound, setIbanNotFound] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIdentifier("");
            setAmount("");
            setDescription("");
            setNamePreview("");
            setNameInput("");
            setIsIbanMode(false);
        }
    }, [isOpen]);

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(value);
    };

    const maskName = (name: string) => {
        return name.split(" ").map(p =>
            p.length > 2 ? p.slice(0, 2) + "*".repeat(p.length - 2) : p[0] + "*"
        ).join(" ");
    };

    const handleIdentifierChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setIdentifier(value);
        setIbanNotFound(false);

        if (value.length > 11 && !value.startsWith("TR")) {
            return;
        }

        if (value.length === 11 && /^\d{11}$/.test(value)) {
            setIsIbanMode(false);
            setNamePreview("");
            setNameInput("");
        } else if (value.length >= 26) {
            setIsIbanMode(true);

            const recipient = await fetchRecipientByIban(value, { silent: true });

            if (recipient) {
                setNamePreview(maskName(recipient.fullName));
                setIbanNotFound(false);
            } else {
                setNamePreview("");
                setNameInput("");
                setIbanNotFound(true);
            }
        } else {
            setIsIbanMode(false);
            setNamePreview("");
            setNameInput("");
        }
    };

    const handleSend = async () => {
        if (!selectedAtm) {
            notify.error("Hata", "Lütfen bir ATM seçiniz.");
            return;
        }
        if (!selectedAccount) {
            notify.error("Hata", "Lütfen bir hesap seçiniz.");
            return;
        }
        if (Number(amount) <= 0) {
            notify.error("Hata", "Lütfen geçerli bir tutar girin.");
            return;
        }

        const baseParams = {
            atmId: selectedAtm.id,
            senderIban: selectedAccount.iban,
            senderFirstName: selectedAccount.name.split(" ")[0] || "",
            senderLastName: selectedAccount.name.split(" ").slice(-1)[0] || "",
            amount,
            description,
        };

        if (identifier.length === 11 && !identifier.startsWith("TR")) {
            const success = await atmTransfer({ ...baseParams, receiverTckn: identifier });
            if (success) togglePanel();
        } else if (identifier.length === 26 && identifier.startsWith("TR")) {
            if (!nameInput.trim()) {
                notify.error("Hata", "Lütfen alıcının tam adını giriniz.");
                return;
            }

            const parts = nameInput.trim().split(" ");
            const receiverFirstName = parts[0];
            const receiverLastName = parts[parts.length - 1];
            let receiverSecondName = "";

            if (parts.length > 2) {
                receiverSecondName = parts.slice(1, -1).join(" ");
            }

            const success = await atmTransfer({
                ...baseParams,
                receiverIban: identifier,
                receiverFirstName,
                receiverSecondName,
                receiverLastName,
            });
            if (success) togglePanel();
        } else {
            notify.error("Hata", "Geçerli bir TC veya IBAN giriniz.");
        }
    };

    if (!isOpen || !selectedAtm) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div
                className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <h2 className="text-lg font-bold">{selectedAtm.name}</h2>
                            <p className="text-xs text-blue-100 opacity-80">Para Transfer İşlemi</p>
                        </div>
                        <button
                            onClick={togglePanel}
                            className="rounded-full p-1 hover:bg-white/20 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[60vh] overflow-y-auto">

                    {/* Hesap Seçimi */}
                    <div className="space-y-1.5">
                        <label
                            className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5" /> Gönderen Hesap
                        </label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 p-3 pl-4 pr-10 text-sm font-medium text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60"
                                onChange={(e) => {
                                    const account = accounts?.find(acc => acc.iban === e.target.value);
                                    if (account) setSelectedAccount(account);
                                }}
                                value={selectedAccount?.iban || ""}
                                disabled={isAccountsLoading}
                            >
                                {isAccountsLoading ? (
                                    <option>Hesaplar yükleniyor...</option>
                                ) : (accounts && accounts.length > 0) ? (
                                    accounts.map((account, index) => (
                                        <option key={index} value={account.iban}>
                                            {account.name} — {formatCurrency(account.balance, account.currency)}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">Hesap bulunamadı</option>
                                )}
                            </select>
                            <div
                                className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                {isAccountsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                    <ChevronDown className="h-4 w-4" />}
                            </div>
                        </div>
                    </div>

                    {/* Alıcı Bilgisi */}
                    <div className="space-y-1.5">
                        <label
                            className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> Alıcı TC / IBAN
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={identifier}
                                onChange={handleIdentifierChange}
                                maxLength={26}
                                placeholder="TR00 0000..."
                                className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                            <div
                                className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                {isIbanLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                    <span className="font-mono text-xs">ID</span>}
                            </div>
                        </div>
                        {ibanNotFound && (
                            <div className="flex items-center gap-1.5 mt-1.5 text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-medium">Bu IBAN`a sahip kişi sistemde bulunamadı.</span>
                            </div>
                        )}
                    </div>

                    {/* Dinamik İsim Alanı (IBAN Modunda) */}
                    {isIbanMode && namePreview && (
                        <div
                            className="rounded-xl bg-blue-50 border border-blue-100 p-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="mb-3 flex items-start gap-2">
                                <div className="mt-0.5 rounded-full bg-blue-100 p-1">
                                    <User className="h-3 w-3 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold">Alıcı Doğrulandı</p>
                                    <p className="text-sm font-bold text-gray-800">{namePreview}</p>
                                </div>
                            </div>

                            <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                Alıcının Tam Adı (Güvenlik için gereklidir)
                            </label>
                            <input
                                type="text"
                                placeholder="Ad Soyad giriniz"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Tutar */}
                        <div className="space-y-1.5">
                            <label
                                className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
                                <Banknote className="w-3.5 h-3.5" /> Tutar
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                                <div
                                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <span className="font-sans font-bold text-gray-500">₺</span>
                                </div>
                            </div>
                        </div>

                        {/* Açıklama */}
                        <div className="space-y-1.5">
                            <label
                                className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" /> Açıklama
                            </label>
                            <input
                                type="text"
                                value={description}
                                maxLength={50}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Örn: Kira"
                                className="w-full rounded-xl border border-gray-300 p-3 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3">
                    <button
                        onClick={togglePanel}
                        className="flex-1 rounded-xl bg-white border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:translate-y-0.5 transition-all"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isTransferLoading}
                        className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isTransferLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> Transfer Yap
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AtmPanel;