'use client';

import React, { useState, useEffect } from "react";
import {
    X,
    CreditCard,
    Calendar,
    Lock,
    User,
    DollarSign,
    CheckCircle2,
    Wallet,
    Loader2,
    AlertTriangle,
    Shield
} from "lucide-react";
import { useAlert } from "@/src/hooks/notification/useAlert";
import AlertBox from "@/src/components/ui/notification/AlertBox";

interface Account {
    id: string;
    name: string;
    currency: string;
    iban: string;
    balance: number;
}

interface DepositMoneyPanelProps {
    toAccount?: Account; // Paranın yatacağı hedef hesap (opsiyonel, seçili gelebilir)
    onClose: () => void;
    onSuccess: () => Promise<void>;
}

export default function DepositMoneyPanel({
    toAccount,
    onClose,
    onSuccess,
}: DepositMoneyPanelProps) {
    // --- STATE ---
    const { alert, showAlert } = useAlert();

    const [formData, setFormData] = useState({
        cardNumber: "",
        cardHolder: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        amount: "",
    });

    const [isFlipped, setIsFlipped] = useState(false); // Kartın dönme durumu
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<{ code: string; message: string } | null>(null);
    const [cardType, setCardType] = useState<"visa" | "mastercard" | "default">("default");

    // --- HELPERS ---

    // Kart numarasını formatla (4 hanede bir boşluk)
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        if (parts.length > 0) return parts.join(" ");
        return v;
    };

    // Kart tipini basitçe belirle
    useEffect(() => {
        const num = formData.cardNumber.replace(/\s/g, "");
        if (num.startsWith("4")) setCardType("visa");
        else if (num.startsWith("5")) setCardType("mastercard");
        else setCardType("default");
    }, [formData.cardNumber]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "cardNumber") {
            if (value.replace(/\s/g, "").length > 16) return; // Max 16 hane
            setFormData({ ...formData, [name]: formatCardNumber(value) });
        } else if (name === "cvv") {
            if (value.length > 3) return; // Max 3 hane
            setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, "") });
        } else if (name === "expiryMonth" || name === "expiryYear") {
            if (value.length > 2) return;
            setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, "") });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!toAccount) {
            showAlert("error", "Hata", "Hesap seçilmedi.");
            return;
        }

        // Kart son kullanma tarihi validasyonu
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        const currentYear = currentDate.getFullYear() % 100; // Son 2 hane (örn: 2024 -> 24)

        const expiryMonth = parseInt(formData.expiryMonth, 10);
        const expiryYear = parseInt(formData.expiryYear, 10);

        if (isNaN(expiryMonth) || isNaN(expiryYear)) {
            showAlert("error", "Hata", "Geçerli bir son kullanma tarihi giriniz.");
            return;
        }

        if (expiryMonth < 1 || expiryMonth > 12) {
            showAlert("error", "Hata", "Geçerli bir ay giriniz (01-12).");
            return;
        }

        // Kart süresi dolmuş mu kontrol et
        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            showAlert("error", "Kart Süresi Dolmuş", "Kartınızın son kullanma tarihi geçmiş. Lütfen geçerli bir kart kullanınız.");
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            showAlert("error", "Hata", "Geçerli bir tutar giriniz.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/transaction/deposit', {
                method: 'POST',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: toAccount.id,
                    amount: amount
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                showAlert("success", "Başarılı", data.processMessage || "Para yatırma işlemi başarılı.");

                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                // Backend'den gelen hata mesajını göster (limit aşımı vb.)
                setError({
                    code: data.processCode || "HATA",
                    message: data.processMessage || "Para yatırma işlemi başarısız."
                });
                showAlert("error", data.processCode || "Hata", data.processMessage || "Para yatırma işlemi başarısız.");
            }
        } catch (err) {
            console.error("Deposit error:", err);
            setError({
                code: "SUNUCU_HATASI",
                message: "Para yatırma işlemi sırasında bir hata oluştu."
            });
            showAlert("error", "Sunucu Hatası", "Para yatırma işlemi sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER ---
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-y-auto py-10">
            {/* Alert Box - Hata/Başarı mesajları için */}
            {alert.type && (
                <AlertBox
                    type={alert.type}
                    title={alert.title ?? ""}
                    message={typeof alert.message === 'string' ? alert.message : undefined}
                />
            )}

            <div className="bg-[#0f1015] border border-[#740001]/30 rounded-2xl shadow-2xl w-full max-w-lg text-white relative flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-[#D3A625]/20 p-6 bg-gradient-to-r from-[#740001] to-[#8B1A1A] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0f1015]/30 rounded-lg flex items-center justify-center shadow-lg border border-[#D3A625]/30">
                            <Wallet className="w-5 h-5 text-[#D3A625]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white">Para Yatır</h2>
                            <p className="text-xs text-[#D3A625]/80">Kredi/Banka Kartı ile Bakiye Yükle</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-[#740001] p-2 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Display - Panel içi hata gösterimi */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-[#740001]/20 border border-[#740001]/50 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 font-semibold text-sm">{error.code}</p>
                                <p className="text-red-300 text-sm mt-1">{error.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {success ? (
                    // --- BAŞARILI EKRANI ---
                    <div className="p-10 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                        <div className="w-24 h-24 bg-[#2e7d32]/20 rounded-full flex items-center justify-center mb-6 animate-bounce border border-[#2e7d32]/50">
                            <CheckCircle2 className="w-12 h-12 text-[#4caf50]" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Ödeme Başarılı!</h2>
                        <p className="text-gray-400 mb-6">
                            <span className="text-[#D3A625] font-semibold">{formData.amount || "0"} ₺</span> tutarındaki bakiye hesabınıza eklendi.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-[#2e7d32] to-[#1b5e20] hover:from-[#1b5e20] hover:to-[#2e7d32] text-white px-8 py-3 rounded-lg font-bold w-full transition-all shadow-lg border border-[#4caf50]/30"
                        >
                            Tamam
                        </button>
                    </div>
                ) : (
                    // --- FORM EKRANI ---
                    <div className="p-6 space-y-8">

                        {/* --- GÖRSEL KART ALANI --- */}
                        <div className="perspective-1000 w-full h-56 flex justify-center mb-4">
                            <div
                                className={`relative w-full max-w-[360px] h-full transition-all duration-700 transform-style-3d ${isFlipped ? "rotate-y-180" : ""
                                    }`}
                            >
                                {/* --- KART ÖN YÜZ --- */}
                                <div className="absolute w-full h-full bg-gradient-to-br from-[#740001] via-[#8B1A1A] to-[#0f1015] rounded-xl p-6 text-white shadow-2xl backface-hidden border border-[#D3A625]/30 flex flex-col justify-between overflow-hidden">
                                    {/* Dekoratif Arkaplan Efektleri */}
                                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-[#D3A625]/10 rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-[#000]/30 rounded-full blur-3xl"></div>

                                    {/* Kart Üst Kısım: Chip ve Logo */}
                                    <div className="flex justify-between items-start z-10">
                                        <div className="w-12 h-9 bg-gradient-to-r from-[#D3A625] to-[#EEBA30] rounded-md border border-[#B8941F] shadow-sm opacity-90 relative overflow-hidden">
                                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                                            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black/20"></div>
                                            <div className="absolute top-2 left-2 w-3 h-5 border border-black/20 rounded-full"></div>
                                        </div>
                                        <div className="text-xl font-bold italic tracking-wider opacity-90 text-[#D3A625]">
                                            {cardType === "visa" ? "VISA" : cardType === "mastercard" ? "MasterCard" : "BAKIRBANK"}
                                        </div>
                                    </div>

                                    {/* Kart Numarası */}
                                    <div className="space-y-1 z-10 mt-4">
                                        <div className="text-2xl font-mono tracking-widest drop-shadow-md text-white">
                                            {formData.cardNumber || "#### #### #### ####"}
                                        </div>
                                    </div>

                                    {/* Kart Alt Kısım: İsim ve Tarih */}
                                    <div className="flex justify-between items-end z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-[#D3A625]/70 uppercase tracking-wider">Kart Sahibi</span>
                                            <span className="font-medium tracking-wide uppercase truncate max-w-[200px] text-[#D3A625]">
                                                {formData.cardHolder || "AD SOYAD"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-[#D3A625]/70 uppercase tracking-wider">SKT</span>
                                            <span className="font-mono text-white">
                                                {formData.expiryMonth || "AA"}/{formData.expiryYear || "YY"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* --- KART ARKA YÜZ --- */}
                                <div className="absolute w-full h-full bg-gradient-to-br from-[#5C0001] to-[#0f1015] rounded-xl shadow-2xl backface-hidden rotate-y-180 border border-[#D3A625]/30 overflow-hidden">
                                    {/* Manyetik Şerit */}
                                    <div className="w-full h-12 bg-black/80 mt-6 relative">
                                        <div className="absolute w-full h-full bg-repeat opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '4px 4px', backgroundPosition: '0 0, 2px 2px' }}></div>
                                    </div>

                                    {/* İmza ve CVV */}
                                    <div className="p-6 mt-2">
                                        <div className="flex flex-col items-end space-y-2">
                                            <span className="text-[10px] text-[#D3A625]/70 uppercase pr-1">CVV / CVC</span>
                                            <div className="w-full flex items-center justify-end">
                                                <div className="bg-white text-black font-mono font-bold py-2 px-4 rounded w-full max-w-[80px] text-right tracking-widest shadow-inner border border-[#D3A625]">
                                                    {formData.cvv || "***"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-center opacity-30">
                                            <Shield className="w-12 h-12 text-[#D3A625]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- INPUT FORMU --- */}
                        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Kart Numarası */}
                            <div className="group">
                                <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 uppercase tracking-wide">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Kart Numarası</span>
                                </label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    maxLength={19}
                                    placeholder="0000 0000 0000 0000"
                                    value={formData.cardNumber}
                                    onChange={handleChange}
                                    onFocus={() => setIsFlipped(false)}
                                    className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-4 py-3 rounded-lg focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] outline-none transition-all placeholder-gray-600 font-mono"
                                    required
                                />
                            </div>

                            {/* İsim Soyisim */}
                            <div>
                                <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 uppercase tracking-wide">
                                    <User className="w-3.5 h-3.5" />
                                    <span>Kart Üzerindeki İsim</span>
                                </label>
                                <input
                                    type="text"
                                    name="cardHolder"
                                    placeholder="AD SOYAD"
                                    value={formData.cardHolder}
                                    onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })}
                                    onFocus={() => setIsFlipped(false)}
                                    className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-4 py-3 rounded-lg focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] outline-none transition-all placeholder-gray-600"
                                    required
                                />
                            </div>

                            {/* Tarih ve CVV Satırı */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 uppercase tracking-wide">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Son Kul. (Ay/Yıl)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="expiryMonth"
                                            placeholder="AA"
                                            maxLength={2}
                                            value={formData.expiryMonth}
                                            onChange={handleChange}
                                            onFocus={() => setIsFlipped(false)}
                                            className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-3 py-3 rounded-lg focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] outline-none text-center font-mono placeholder-gray-600"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="expiryYear"
                                            placeholder="YY"
                                            maxLength={2}
                                            value={formData.expiryYear}
                                            onChange={handleChange}
                                            onFocus={() => setIsFlipped(false)}
                                            className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-3 py-3 rounded-lg focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] outline-none text-center font-mono placeholder-gray-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 uppercase tracking-wide">
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>CVV</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        maxLength={3}
                                        placeholder="***"
                                        value={formData.cvv}
                                        onChange={handleChange}
                                        onFocus={() => setIsFlipped(true)}
                                        onBlur={() => setIsFlipped(false)}
                                        className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-4 py-3 rounded-lg focus:ring-1 focus:ring-[#D3A625] focus:border-[#D3A625] outline-none text-center font-mono placeholder-gray-600"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tutar */}
                            <div className="pt-2 border-t border-[#740001]/30">
                                <label className="flex items-center space-x-2 text-xs font-semibold text-[#D3A625] mb-1.5 uppercase tracking-wide">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>Yatırılacak Tutar</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="amount"
                                        min="1"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        onFocus={() => setIsFlipped(false)}
                                        className="w-full bg-[#12131a] border border-[#740001]/30 text-white px-4 py-4 rounded-lg focus:ring-1 focus:ring-[#D3A625]  text-lg font-bold placeholder-gray-600 pl-10"
                                        required
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D3A625] text-lg">₺</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#D3A625] to-[#EEBA30] hover:from-[#EEBA30] hover:to-[#D3A625] text-[#0a0b0f] py-4 rounded-lg font-bold text-sm shadow-lg shadow-[#D3A625]/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>İşleniyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>{formData.amount ? `${formData.amount} ₺ Yatır` : "Ödemeyi Onayla"}</span>
                                    </>
                                )}
                            </button>

                        </form>
                    </div>
                )}
            </div>

            {/* Tailwind CSS 3D Helper Styles (Eğer global CSS'de yoksa buraya style tagı olarak ekliyoruz) */}
            <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </div>
    );
}