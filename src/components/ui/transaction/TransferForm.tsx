// components/TransferForm.tsx
import React, { useState, useEffect } from "react";
import { Building2, CreditCard, DollarSign, FileText, Send, RefreshCw, CheckCircle2 } from "lucide-react";
import { Account } from '@/src/types/account';
import { TransferData } from '@/src/types/transaction';
import { useTransactions } from "@/src/hooks/useTransaction";

interface TransferFormProps {
    fromAccounts: Account[];
    selectedAccount?: Account;
    initialData?: {
        accountIBAN?: string;
        firstName?: string;
        secondName?: string;
        lastName?: string;
    };
    currencySymbols: Record<string, string>;
    isLoading: boolean;
    onSubmit: (data: TransferData) => void;
    onClose: () => void;
    showAlert: (type: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

export default function TransferForm({
    fromAccounts,
    selectedAccount,
    initialData,
    currencySymbols,
    isLoading,
    onSubmit,
    onClose,
    showAlert
}: TransferFormProps) {

    const [formData, setFormData] = useState<TransferData>({
        fromIBAN: selectedAccount?.iban || "",
        toIBAN: "",
        amount: "",
        description: "",
        toFirstName: "",
        toSecondName: undefined,
        toLastName: "",
    });

    const { fetchRecipientByIban, isIbanLoading } = useTransactions({
        selectedAccountId: selectedAccount?.iban,
        showAlert
    });

    const [recipientNameConfirm, setRecipientNameConfirm] = useState("");
    const [recipientName, setRecipientName] = useState<string | null>(null);
    const [nameMatch, setNameMatch] = useState<boolean | null>(null);

    const currentAccount = fromAccounts.find(a => a.iban === formData.fromIBAN);

    useEffect(() => {
        if (initialData) {
            const fullName = [initialData.firstName, initialData.secondName, initialData.lastName]
                .filter(Boolean)
                .join(" ");

            setFormData(prev => ({
                ...prev,
                toIBAN: initialData.accountIBAN || "",
                toFirstName: initialData.firstName || "",
                toSecondName: initialData.secondName,
                toLastName: initialData.lastName || "",
            }));
            setRecipientNameConfirm(fullName);
            setRecipientName(fullName);
            setNameMatch(true);
        }
    }, [initialData]);

    const maskName = (name: string) => {
        return name.split(" ").map(p => p.length > 2 ? p[0] + "*".repeat(p.length - 1) : p[0] + "*").join(" ");
    };

    const handleIbanChange = async (iban: string) => {
        setFormData(prev => ({ ...prev, toIBAN: iban }));
        setNameMatch(null);

        const recipient = await fetchRecipientByIban(iban, { silent: true });

        if (recipient) {
            setRecipientName(recipient.fullName);
            setFormData(prev => ({
                ...prev,
                toFirstName: recipient.firstName,
                toSecondName: recipient.secondName,
                toLastName: recipient.lastName,
            }));
            showAlert("info", "Alıcı Bulundu", "IBAN sahibinin adı getirildi.");
        } else {
            setRecipientName(null);
            setFormData(prev => ({
                ...prev,
                toFirstName: "",
                toSecondName: undefined,
                toLastName: ""
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "fromIBAN") {
            setFormData(prev => ({ ...prev, fromIBAN: value }));
        } else if (name === "amount" || name === "description") {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else if (name === "recipientNameConfirm") {
            setRecipientNameConfirm(value);
            if (recipientName) {
                const isMatch = value.trim().toUpperCase() === recipientName.trim().toUpperCase();
                setNameMatch(isMatch);
            }
        }
    };

    const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIban = e.target.value;
        setFormData(prev => ({ ...prev, fromIBAN: selectedIban }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fromIBAN || !formData.toIBAN || !formData.amount) {
            showAlert("error", "Eksik Bilgi", "Zorunlu alanları doldurun.");
            return;
        }

        if (recipientName && !nameMatch) {
            showAlert("warning", "Doğrulama", "İsim doğrulaması başarısız.");
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
                <label className="flex items-center space-x-2 text-xs font-bold text-[#D3A625]/90 mb-2 uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Kaynak Hesap</span>
                </label>
                <select
                    name="fromIBAN"
                    value={formData.fromIBAN}
                    onChange={handleAccountChange}
                    className="w-full bg-[#1e222d] border border-[#740001]/20 text-white px-4 py-3.5 rounded-xl text-sm focus:border-[#D3A625]/50 focus:ring-1 focus:ring-[#D3A625]/50 outline-none transition-all appearance-none cursor-pointer hover:bg-[#252a36]"
                >
                    <option value="">Hesap Seçiniz</option>
                    {fromAccounts.map((acc) => (
                        <option key={acc.id} value={acc.iban}>
                            {acc.name} • {acc.iban.slice(-8)} • {currencySymbols[acc.currency]}{acc.balance.toLocaleString()}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="flex items-center space-x-2 text-xs font-bold text-[#D3A625]/90 mb-2 uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Alıcı IBAN</span>
                </label>
                <div className="relative">
                    <input
                        name="toIBAN"
                        value={formData.toIBAN}
                        onChange={(e) => handleIbanChange(e.target.value)}
                        placeholder="TR..."
                        maxLength={32}
                        className="w-full bg-[#1e222d] border border-[#740001]/20 text-white px-4 py-3.5 rounded-xl text-sm focus:border-[#D3A625]/50 focus:ring-1 focus:ring-[#D3A625]/50 outline-none transition-all font-mono tracking-wide placeholder-gray-600 focus:placeholder-gray-500"
                    />
                    {isIbanLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <RefreshCw className="w-4 h-4 text-[#D3A625] animate-spin" />
                        </div>
                    )}
                </div>
                {recipientName && (
                    <div className="mt-2 bg-[#740001]/10 border border-[#740001]/20 rounded-lg p-2.5 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-4 h-4 text-[#D3A625]" />
                        <span className="text-gray-400 text-xs">Alıcı: <span className="text-white font-semibold ml-1">{maskName(recipientName)}</span></span>
                    </div>
                )}
            </div>

            {recipientName && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="flex items-center space-x-2 text-xs font-bold text-[#D3A625]/90 mb-2 uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Alıcı İsmini Doğrula</span>
                    </label>
                    <div className="relative group">
                        <input
                            name="recipientNameConfirm"
                            value={recipientNameConfirm}
                            onChange={handleChange}
                            placeholder="Alıcı Ad ve Soyadını Giriniz"
                            className={`w-full bg-[#1e222d] border px-4 py-3.5 rounded-xl text-sm focus:outline-none transition-all placeholder-gray-600 ${nameMatch === false
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                                : nameMatch
                                    ? 'border-green-500/50 focus:border-green-500 focus:ring-1 focus:ring-green-500/50'
                                    : 'border-[#740001]/20 focus:border-[#D3A625]/50 focus:ring-1 focus:ring-[#D3A625]/50'
                                }`}
                        />
                        {nameMatch === true && (
                            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in" />
                        )}
                    </div>
                    {nameMatch === false && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium">İsim uyuşmuyor, lütfen kontrol ediniz.</p>}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="flex items-center space-x-2 text-xs font-bold text-[#D3A625]/90 mb-2 uppercase tracking-wider">
                        <DollarSign className="w-3.5 h-3.5" />
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
                            className="w-full bg-[#1e222d] border border-[#740001]/20 text-white px-4 py-3.5 rounded-xl text-sm focus:border-[#D3A625]/50 focus:ring-1 focus:ring-[#D3A625]/50 outline-none transition-all font-bold text-lg"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D3A625] font-bold">
                            {currentAccount ? currencySymbols[currentAccount.currency] : "₺"}
                        </span>
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="flex items-center space-x-2 text-xs font-bold text-[#D3A625]/90 mb-2 uppercase tracking-wider">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Açıklama</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Transfer açıklaması (opsiyonel)"
                        className="w-full bg-[#1e222d] border border-[#740001]/20 text-white px-4 py-3.5 rounded-xl text-sm resize-none focus:border-[#D3A625]/50 focus:ring-1 focus:ring-[#D3A625]/50 outline-none transition-all placeholder-gray-600"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#740001]/10">
                <button type="button" onClick={onClose}
                    className="flex-1 bg-[#1e222d] hover:bg-[#252a36] border border-[#740001]/20 text-gray-300 hover:text-white px-6 py-3.5 rounded-xl text-sm transition-all font-medium">
                    İptal
                </button>
                <button
                    type="submit"
                    disabled={isLoading || (recipientName !== null && !nameMatch)}
                    className={`flex-[2] flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all ${isLoading || (recipientName !== null && !nameMatch)
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                        : 'bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#740001] text-white border border-[#D3A625]/20 hover:border-[#D3A625]/40 hover:shadow-[#740001]/30 hover:-translate-y-0.5'
                        }`}
                >
                    {isLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <><Send className="w-4 h-4 text-[#D3A625]" /> Devam Et</>}
                </button>
            </div>
        </form>
    );
}
