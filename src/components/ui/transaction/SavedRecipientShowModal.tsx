'use client';

import { useState } from "react";
import { RefreshCw, Send, Plus, X, UserPlus, Building2, Tag, Smartphone } from "lucide-react";
import { SavedRecipient } from "@/src/types/account";


interface propsSavedRecipientPanel {
    onRecipientSelect?: (r: SavedRecipient) => void;
    showRecipientForm?: boolean;
    setShowRecipientForm?: (v: boolean) => void;
    setShowTransferPanel?: (v: boolean) => void;
    savedRecipients: SavedRecipient[];
    onRefresh: () => void;
    isLoadingList: boolean;
}

function SavedRecipientsPanel({
    onRecipientSelect,
    showRecipientForm: controlledShow,
    setShowRecipientForm: controlledSetShowRecipientForm,
    setShowTransferPanel: controlledSetShowTransferPanel,
    savedRecipients,
    onRefresh,
    isLoadingList
}: propsSavedRecipientPanel) {
    const [internalShowRecipientForm, internalSetShowRecipientForm] = useState(false);
    const [internalShowTransferPanel, internalSetShowTransferPanel] = useState(false);
    const showRecipientForm = controlledShow ?? internalShowRecipientForm;
    const setShowRecipientForm = controlledSetShowRecipientForm ?? internalSetShowRecipientForm;
    const setShowTransferPanel = controlledSetShowTransferPanel ?? internalSetShowTransferPanel;

    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ibanLoading, setIbanLoading] = useState(false);

    const [newRecipient, setNewRecipient] = useState({
        nickname: "",
        accountIBAN: "",
        firstName: "",
        secondName: "",
        lastName: "",
    });

    async function fetchRecipientByIBAN(iban: string) {
        if (iban.length !== 26) return;

        setIbanLoading(true);
        try {
            const res = await fetch(`/api/account/get-name-by-iban?iban=${encodeURIComponent(iban)}`, {
                method: "GET",
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok && data.firstName) {
                setNewRecipient(prev => ({
                    ...prev,
                    firstName: data.firstName || "",
                    secondName: data.secondName || "",
                    lastName: data.lastName || "",
                }));
            }
        } catch (error) {
            console.error("IBAN lookup error:", error);
        } finally {
            setIbanLoading(false);
        }
    }

    const handleIBANChange = (value: string) => {
        setNewRecipient(prev => ({ ...prev, accountIBAN: value }));
        if (value.length === 26) {
            fetchRecipientByIBAN(value);
        } else {
            setNewRecipient(prev => ({
                ...prev,
                firstName: "",
                secondName: "",
                lastName: "",
            }));
        }
    };

    const handleAddRecipient = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newRecipient.nickname || !newRecipient.accountIBAN || !newRecipient.firstName || !newRecipient.lastName) {
            alert("Lütfen tüm zorunlu alanları doldurun!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/account/saved/create", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRecipient),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.message || "Alıcı eklenemedi!");
                return;
            }

            onRefresh();
            setShowAddForm(false);
            setNewRecipient({
                nickname: "",
                accountIBAN: "",
                firstName: "",
                secondName: "",
                lastName: "",
            });
        } catch (error) {
            console.error("Add recipient error:", error);
            alert("Bir hata oluştu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999]">
            <button
                onClick={() => setShowRecipientForm(!showRecipientForm)}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#740001] px-5 py-3 rounded-full text-white font-semibold text-sm shadow-xl hover:shadow-[#740001]/40 border border-[#D3A625]/30 transition-all tracking-wide transform hover:scale-105"
            >
                <Send className="w-4 h-4 text-[#D3A625]" />
                <span>Kayıtlı Alıcılar</span>
            </button>

            {showRecipientForm && !showAddForm && (
                <div className="absolute bottom-16 right-0 bg-[#0f1015]/95 backdrop-blur-md z-[9999] border border-[#740001]/30 rounded-2xl shadow-2xl p-5 w-80 transition-all transform scale-100 origin-bottom-right animate-in slide-in-from-bottom-5">
                    <div className="flex items-center justify-between mb-4 border-b border-[#D3A625]/20 pb-3">
                        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                            <Send className="w-4 h-4 text-[#D3A625]" />
                            Kayıtlı Alıcılar
                        </h3>
                        <button
                            onClick={() => onRefresh()}
                            className="text-[#D3A625]/70 hover:text-[#D3A625] transition-colors bg-[#740001]/10 p-1.5 rounded-lg"
                            title="Yenile"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {savedRecipients.length === 0 ? (
                        <div className="text-center py-6">
                            <div className="bg-[#740001]/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#D3A625]/20">
                                <UserPlus className="w-6 h-6 text-[#D3A625]/50" />
                            </div>
                            <p className="text-gray-400 text-sm font-normal">
                                {isLoadingList ? 'Yükleniyor...' : 'Henüz kayıtlı alıcı bulunmuyor.'}
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {savedRecipients.map((rec) => (
                                <li key={rec.id} className="flex justify-between items-center bg-[#12131a] border border-[#740001]/20 hover:border-[#D3A625]/40 hover:bg-[#740001]/10 rounded-xl px-4 py-3 transition-all group">
                                    <div>
                                        <p className="text-[#D3A625] text-sm font-semibold tracking-tight group-hover:text-[#EEBA30]">{rec.nickname}</p>
                                        <p className="text-gray-300 text-xs font-normal">
                                            {[rec.firstName, rec.secondName, rec.lastName].filter(Boolean).join(" ")}
                                        </p>
                                        <p className="text-gray-500 text-[10px] font-mono mt-1 opacity-70">
                                            {rec.accountIBAN ? `${rec.accountIBAN.slice(0, 6)}...${rec.accountIBAN.slice(-4)}` : "—"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onRecipientSelect?.(rec);
                                            setShowTransferPanel(true);
                                            setShowRecipientForm(false);
                                        }}
                                        className="bg-[#D3A625]/10 hover:bg-[#D3A625]/30 p-2 rounded-lg transition-colors border border-[#D3A625]/20"
                                        title="Para Gönder"
                                    >
                                        <Send className="w-4 h-4 text-[#D3A625]" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="flex gap-2 mt-4 pt-3 border-t border-[#D3A625]/10">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex-1 py-2.5 bg-gradient-to-r from-[#D3A625] to-[#EEBA30] hover:from-[#EEBA30] hover:to-[#D3A625] text-[#0a0b0f] text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg tracking-wide transform active:scale-[0.98]"
                        >
                            <Plus className="w-4 h-4" />
                            Ekle
                        </button>
                        <button
                            onClick={() => setShowRecipientForm(false)}
                            className="flex-1 py-2.5 bg-[#12131a] hover:bg-[#740001]/20 border border-[#740001]/30 hover:border-[#740001]/50 text-white text-sm font-semibold rounded-xl transition-all tracking-wide"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}

            {/* Alıcı Ekleme Formu */}
            {showRecipientForm && showAddForm && (
                <div className="absolute bottom-16 right-0 bg-[#0f1015]/95 backdrop-blur-md z-[9999] border border-[#740001]/30 rounded-2xl shadow-2xl p-5 w-96 transition-all transform scale-100 origin-bottom-right animate-in slide-in-from-right-5">
                    <div className="flex items-center justify-between mb-5 border-b border-[#D3A625]/20 pb-3">
                        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-[#D3A625]" />
                            Yeni Alıcı Ekle
                        </h3>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="text-gray-400 hover:text-white hover:bg-[#740001]/30 p-1.5 rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleAddRecipient} className="space-y-4">
                        {/* Takma Ad */}
                        <div className="group">
                            <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 tracking-wide uppercase">
                                <Tag className="w-3.5 h-3.5" />
                                <span>Takma Ad</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.nickname}
                                onChange={(e) => setNewRecipient(prev => ({ ...prev, nickname: e.target.value }))}
                                placeholder="Örn: Ahmet Abi"
                                className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] placeholder-gray-600 font-normal text-sm transition-all"
                                required
                            />
                        </div>

                        {/* IBAN */}
                        <div>
                            <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 tracking-wide uppercase">
                                <Building2 className="w-3.5 h-3.5" />
                                <span>IBAN</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.accountIBAN}
                                onChange={(e) => handleIBANChange(e.target.value)}
                                placeholder="TR000000000000000000000000"
                                maxLength={26}
                                className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] placeholder-gray-600 font-mono text-sm transition-all"
                                required
                            />
                            {ibanLoading && (
                                <div className="flex items-center space-x-2 mt-2 text-[#D3A625] animate-pulse">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    <span className="text-xs font-normal">Alıcı bilgisi kontrol ediliyor...</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 tracking-wide uppercase">
                                <span>Ad</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.firstName}
                                onChange={(e) => setNewRecipient(prev => ({ ...prev, firstName: e.target.value }))}
                                placeholder="Ad"
                                className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] placeholder-gray-600 font-normal text-sm transition-all"
                                required
                                readOnly={ibanLoading}
                            />
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 tracking-wide uppercase">
                                <span>İkinci Ad (Opsiyonel)</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.secondName}
                                onChange={(e) => setNewRecipient(prev => ({ ...prev, secondName: e.target.value }))}
                                placeholder="İkinci ad"
                                className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] placeholder-gray-600 font-normal text-sm transition-all"
                                readOnly={ibanLoading}
                            />
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 tracking-wide uppercase">
                                <span>Soyad</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.lastName}
                                onChange={(e) => setNewRecipient(prev => ({ ...prev, lastName: e.target.value }))}
                                placeholder="Soyad"
                                className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] placeholder-gray-600 font-normal text-sm transition-all"
                                required
                                readOnly={ibanLoading}
                            />
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-[#D3A625]/10">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 py-2.5 bg-[#12131a] hover:bg-[#740001]/20 border border-[#740001]/30 text-white text-sm font-semibold rounded-xl transition-all tracking-wide"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || ibanLoading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#740001] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-[#D3A625]/20 tracking-wide transform active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Kaydediliyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        <span>Kaydet</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(116, 0, 1, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #740001;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D3A625;
                }
            `}</style>
        </div>
    );
}

export default function SavedRecipientShowModal({
    onRecipientSelect,
    showRecipientForm,
    setShowRecipientForm,
    setShowTransferPanel,
    savedRecipients,
    onRefresh,
    isLoadingList
}: propsSavedRecipientPanel
) {
    return (
        <SavedRecipientsPanel
            onRecipientSelect={onRecipientSelect}
            showRecipientForm={showRecipientForm}
            setShowTransferPanel={setShowTransferPanel}
            setShowRecipientForm={setShowRecipientForm}
            savedRecipients={savedRecipients}
            onRefresh={onRefresh}
            isLoadingList={isLoadingList}
        />
    );
}