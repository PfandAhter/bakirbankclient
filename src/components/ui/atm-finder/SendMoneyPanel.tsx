"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Account {
    iban: string;
    name: string;
    balance: number;
    currency: string;
}

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
}

const AtmPanel: React.FC<AtmPanelProps> = ({ isOpen, togglePanel, selectedAtm }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountIban, setSelectedAccountIban] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [namePreview, setNamePreview] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [isIbanMode, setIsIbanMode] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchAccounts = async () => {
            try {
                const response = await axios.post("http://localhost:8081/api/v1/account/get", {
                    token: "test",
                });
                if (response.status === 200) {
                    setAccounts(response.data.accounts || []);
                    localStorage.setItem("senderFirstName", response.data.firstName);
                    localStorage.setItem("senderSecondName", response.data.secondName);
                    localStorage.setItem("senderLastName", response.data.lastName);
                }
            } catch (error) {
                console.error("Hesaplar alınamadı:", error);
            }
        };

        fetchAccounts();
    }, [isOpen]);

    const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setIdentifier(value);

        if (value.length > 11 && !value.startsWith("TR")) {
            alert("Lütfen geçerli bir TC veya IBAN giriniz.");
            return;
        }

        if (value.length === 11 && /^\d{11}$/.test(value)) {
            setIsIbanMode(false);
            setNamePreview("");
            setNameInput("");
        } else if (value.length >= 26) {
            setIsIbanMode(true);

            axios
                .get(`http://localhost:8081/api/v1/account/get/user/by-iban?iban=${value}`)
                .then((res) => {
                    const { firstName, secondName, lastName } = res.data;

                    const maskedFirst = firstName?.slice(0, 2) + "*".repeat(firstName.length - 2 || 0);
                    const maskedSecond = secondName ? secondName.slice(0, 2) + "*".repeat(secondName.length - 2) : "";
                    const maskedLast = lastName?.slice(0, 2) + "*".repeat(lastName.length - 2 || 0);

                    setNamePreview([maskedFirst, maskedSecond, maskedLast].filter(Boolean).join(" "));
                })
                .catch((err) => {
                    console.error("IBAN ile kullanıcı bulunamadı:", err);
                    setNamePreview("");
                    setNameInput("");
                });
        } else {
            setIsIbanMode(false);
            setNamePreview("");
            setNameInput("");
        }
    };

    const handleSend = () => {
        if (Number(amount) <= 0) {
            alert("Lütfen geçerli bir tutar girin.");
            return;
        }

        if (identifier.length === 11 && !identifier.startsWith("TR")) {
            axios
                .post("http://localhost:8082/api/v1/transaction/transfer/atm", {
                    atmId: selectedAtm.id,
                    senderIban: selectedAccountIban,
                    senderFirstName: localStorage.getItem("senderFirstName"),
                    senderSecondName: localStorage.getItem("senderSecondName"),
                    senderLastName: localStorage.getItem("senderLastName"),
                    receiverTckn: identifier,
                    amount,
                    description,
                })
                .then(() => alert("Transfer başarılı."))
                .catch(console.error);
        } else if (identifier.length === 26 && identifier.startsWith("TR")) {
            if (!nameInput.trim()) {
                alert("Lütfen alıcının tam adını giriniz.");
                return;
            }

            let receiverFirstName = "";
            let receiverSecondName = "";
            let receiverLastName = "";

            const parts = nameInput.split(" ");
            if (parts.length === 3) {
                [receiverFirstName, receiverSecondName, receiverLastName] = parts;
            } else {
                [receiverFirstName, receiverLastName] = parts;
            }

            axios
                .post("http://localhost:8082/api/v1/transaction/transfer/atm", {
                    atmId: selectedAtm.id,
                    senderIban: selectedAccountIban,
                    senderFirstName: localStorage.getItem("senderFirstName"),
                    senderSecondName: localStorage.getItem("senderSecondName"),
                    senderLastName: localStorage.getItem("senderLastName"),
                    receiverIban: identifier,
                    receiverFirstName,
                    receiverSecondName,
                    receiverLastName,
                    amount,
                    description,
                })
                .then(() => alert("Transfer başarılı."))
                .catch(console.error);
        } else {
            alert("Geçerli bir TC veya IBAN giriniz.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div
                className="
          w-[95%] max-w-md rounded-2xl bg-white p-6 shadow-2xl
          animate-[slideIn_0.3s_ease-out] font-sans
        "
            >
                <h2 className="mb-5 text-center text-xl font-bold text-gray-800">
                    {selectedAtm.name} ATM - Para Gönder
                </h2>

                <label className="block mb-3 text-sm font-medium text-gray-700">
                    Hesap Seç:
                    <select
                        className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        onChange={(e) => setSelectedAccountIban(e.target.value)}
                        value={selectedAccountIban}
                    >
                        <option value="">-- Hesap Seçiniz --</option>
                        {accounts.map((account, index) => (
                            <option key={index} value={account.iban}>
                                {account.name} - {account.balance} ({account.currency})
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block mb-3 text-sm font-medium text-gray-700">
                    Alıcı TC / IBAN:
                    <input
                        type="text"
                        value={identifier}
                        onChange={handleIdentifierChange}
                        maxLength={26}
                        minLength={11}
                        className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </label>

                {isIbanMode && namePreview && (
                    <>
                        <p className="mb-2 text-sm text-gray-600">
                            Alıcı İsim Önizleme: <strong>{namePreview}</strong>
                        </p>
                        <label className="block mb-3 text-sm font-medium text-gray-700">
                            Alıcının Tam Adı:
                            <input
                                type="text"
                                placeholder="Örn: Ahmet Kemal Taner"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <small className="text-xs text-gray-500">
                                Lütfen alıcının tam adını ve soyadını giriniz.
                            </small>
                        </label>
                    </>
                )}

                <label className="block mb-3 text-sm font-medium text-gray-700">
                    Gönderilecek Tutar (TL):
                    <input
                        type="number"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </label>

                <label className="block mb-3 text-sm font-medium text-gray-700">
                    Açıklama:
                    <input
                        type="text"
                        value={description}
                        maxLength={50}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </label>

                <div className="mt-5 flex gap-3">
                    <button
                        onClick={handleSend}
                        className="flex-1 rounded-lg bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 active:scale-95 transition"
                    >
                        Gönder
                    </button>
                    <button
                        onClick={togglePanel}
                        className="flex-1 rounded-lg bg-gray-200 py-2 text-gray-700 font-semibold hover:bg-gray-300 active:scale-95 transition"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AtmPanel;
