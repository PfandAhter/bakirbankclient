'use client';

import { useState } from "react";
import { RefreshCw, Send, Plus, X, UserPlus, Building2, Tag } from "lucide-react";
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
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-lg transition-all tracking-wide"
            >
                <Send className="w-4 h-4" />
                <span>Kayıtlı Alıcılar</span>
            </button>

            {showRecipientForm && !showAddForm && (
                <div className="absolute bottom-16 right-0 bg-[#0c0d13]/95 backdrop-blur-md z-[9999] border border-[#1e222d] rounded-2xl shadow-2xl p-5 w-80 transition-all transform scale-100 origin-bottom-right">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                            <Send className="w-4 h-4 text-blue-400" />
                            Kayıtlı Alıcılar
                        </h3>
                        <button
                            onClick={() => onRefresh()}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                            title="Yenile"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {savedRecipients.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-3 font-normal">
                            {isLoadingList ? 'Yükleniyor...' : 'Henüz kayıtlı alıcı bulunmuyor.'}
                        </p>
                    ) : (
                        <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {savedRecipients.map((rec) => (
                                <li key={rec.id} className="flex justify-between items-center bg-[#1e293b]/40 border border-[#1e222d] hover:bg-[#1e293b]/70 rounded-lg px-4 py-3 transition-all">
                                    <div>
                                        <p className="text-white text-sm font-semibold tracking-tight">{rec.nickname}</p>
                                        <p className="text-gray-300 text-xs font-normal">
                                            {[rec.firstName, rec.secondName, rec.lastName].filter(Boolean).join(" ")}
                                        </p>
                                        <p className="text-gray-500 text-xs font-normal mt-1">
                                            {rec.accountIBAN ? `${rec.accountIBAN.slice(0, 6)}...${rec.accountIBAN.slice(-4)}` : "—"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onRecipientSelect?.(rec);
                                            setShowTransferPanel(true);
                                            setShowRecipientForm(false);
                                        }}
                                        className="bg-blue-600/20 hover:bg-blue-600/40 p-2 rounded-lg transition-colors"
                                        title="Para Gönder"
                                    >
                                        <Send className="w-4 h-4 text-blue-400" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg tracking-wide"
                        >
                            <Plus className="w-4 h-4" />
                            Ekle
                        </button>
                        <button
                            onClick={() => setShowRecipientForm(false)}
                            className="flex-1 py-2 bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-semibold rounded-lg transition-all tracking-wide"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}

            {/* Alıcı Ekleme Formu */}
            {showRecipientForm && showAddForm && (
                <div className="absolute bottom-16 right-0 bg-[#0c0d13]/95 backdrop-blur-md z-[9999] border border-[#1e222d] rounded-2xl shadow-2xl p-5 w-96 transition-all transform scale-100 origin-bottom-right">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-blue-400" />
                            Yeni Alıcı Ekle
                        </h3>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="text-gray-400 hover:text-white hover:bg-[#1e293b] p-1.5 rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleAddRecipient} className="space-y-4">
                        {/* Takma Ad */}
                        <div>
                            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-300 mb-1.5 tracking-wide">
                                <Tag className="w-3.5 h-3.5 text-blue-400" />
                                <span>Takma Ad</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.nickname}
                                onChange={(e) => setNewRecipient(prev => ({ ...prev, nickname: e.target.value }))}
                                placeholder="Örn: Ahmet Abi"
                                className="w-full bg-[#1e293b] border border-[#1e222d] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 font-normal text-sm transition-all"
                                required
                            />
                        </div>

                        {/* IBAN */}
                        <div>
                            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-300 mb-1.5 tracking-wide">
                                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                <span>IBAN</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.accountIBAN}
                                onChange={(e) => handleIBANChange(e.target.value)}
                                placeholder="TR000000000000000000000000"
                                maxLength={26}
                                className="w-full bg-[#1e293b] border border-[#1e222d] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 font-normal text-sm transition-all"
                                required
                            />
                            {ibanLoading && (
                                <div className="flex items-center space-x-2 mt-2 text-blue-400">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    <span className="text-xs font-normal">Alıcı bilgisi kontrol ediliyor...</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-300 mb-1.5 tracking-wide">
                                <span>Ad</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.firstName}
                                onChange={(e) => setNewRecipient(prev => ({ ...prev, firstName: e.target.value }))}
                                placeholder="Ad"
                                className="w-full bg-[#1e293b] border border-[#1e222d] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 font-normal text-sm transition-all"
                                required
                                readOnly={ibanLoading}
                            />
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-300 mb-1.5 tracking-wide">
                                <span>İkinci Ad (Opsiyonel)</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.secondName}
                                onChange={(e) => setNewRecipient(prev => ({ ...prev, secondName: e.target.value }))}
                                placeholder="İkinci ad"
                                className="w-full bg-[#1e293b] border border-[#1e222d] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 font-normal text-sm transition-all"
                                readOnly={ibanLoading}
                            />
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-300 mb-1.5 tracking-wide">
                                <span>Soyad</span>
                            </label>
                            <input
                                type="text"
                                value={newRecipient.lastName}
                                onChange={(e) => setNewRecipient(prev => ({ ...prev, lastName: e.target.value }))}
                                placeholder="Soyad"
                                className="w-full bg-[#1e293b] border border-[#1e222d] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 font-normal text-sm transition-all"
                                required
                                readOnly={ibanLoading}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 py-2 bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-semibold rounded-lg transition-all tracking-wide"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || ibanLoading}
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg tracking-wide"
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
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3b82f6;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #2563eb;
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