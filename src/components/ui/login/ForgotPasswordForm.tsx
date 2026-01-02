'use client';

import React, { useState } from "react";
import { Input } from "@/src/components/ui/Input";
import { useAlert } from "@/src/hooks/notification/useAlert";
import AlertBox from "@/src/components/ui/notification/AlertBox";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Mail, Lock, KeyRound, ArrowLeft, Sparkles, Shield } from 'lucide-react';

interface ForgotPasswordFormProps {
    onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
    onBackToLogin,
}) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { alert, showAlert } = useAlert();

    const handleSendCode = async () => {
        setLoading(true);
        if (!email) return showAlert("destructive", "Hata", "E-posta adresi gerekli.");

        try {
            await fetch(`/api/auth/password/send-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email }),
            });

            showAlert("success", "Kod Gönderildi", "E-postanıza doğrulama kodu gönderildi.");
            setStep(2);
        } catch (error: any) {
            showAlert("destructive", "Hata", error.message || "Kod gönderilemedi.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            return showAlert("destructive", "Hata", "Şifreler eşleşmiyor.");
        }
        try {
            await fetch(`/api/auth/password/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, confirmPassword }),
            });

            showAlert("success", "Şifre Yenilendi", "Yeni şifrenizle giriş yapabilirsiniz.");
            onBackToLogin();
        } catch (error: any) {
            showAlert("destructive", "Hata", error.message || "Şifre sıfırlanamadı.");
        } finally {
            setLoading(true);
        }
    };

    const handleChangeOTPCodeInput = async (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        setOtp(numericValue);
        if (numericValue.length === 6) {
            setLoading(true);
            try {
                const response = await fetch(`/api/auth/password/verify-reset-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp }),
                });

                if (!response.ok) throw new Error('OTP doğrulama başarısız.');

                showAlert("success", "Kod Onaylandı", "Şimdi yeni şifrenizi belirleyin.");
                setTimeout(() => {
                    setStep(3);
                }, 1000);
            } catch (error: any) {
                showAlert('destructive', 'Hata', error.message || 'Kod doğrulama başarısız.');
            } finally {
                setLoading(false);
            }
        }
    };

    const getStepIcon = () => {
        switch (step) {
            case 1: return <Mail className="w-8 h-8 text-[#D3A625]" />;
            case 2: return <KeyRound className="w-8 h-8 text-[#D3A625]" />;
            case 3: return <Lock className="w-8 h-8 text-[#D3A625]" />;
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return "E-posta Doğrulama";
            case 2: return "Kod Doğrulama";
            case 3: return "Yeni Şifre";
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0a0b0f]/95 backdrop-blur-xl flex items-center justify-center z-50">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#740001]/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#D3A625]/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative bg-[#0f1015]/95 backdrop-blur-xl border border-[#740001]/30 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center text-white">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#740001]/5 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="relative">
                    <h1 className="text-3xl font-bold text-white text-center mb-2">
                        <span className="text-[#D3A625]">BAKIR</span>BANK
                    </h1>

                    {/* Step indicator */}
                    <div className="flex justify-center mb-4">
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${s === step
                                            ? 'bg-gradient-to-br from-[#740001] to-[#5C0001] text-[#D3A625] border-2 border-[#D3A625]/50 shadow-lg'
                                            : s < step
                                                ? 'bg-[#740001]/50 text-[#D3A625]/80 border border-[#D3A625]/30'
                                                : 'bg-[#12131a] text-gray-500 border border-[#740001]/20'
                                        }`}>
                                        {s}
                                    </div>
                                    {s < 3 && (
                                        <div className={`w-8 h-0.5 mx-1 transition-all duration-300 ${s < step ? 'bg-[#D3A625]/50' : 'bg-[#740001]/30'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step icon */}
                    <div className="flex justify-center mb-4">
                        <div className="relative w-16 h-16 bg-gradient-to-br from-[#740001] to-[#5C0001] rounded-full flex items-center justify-center border-2 border-[#D3A625]/30 shadow-lg">
                            {getStepIcon()}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D3A625]/10 to-transparent pointer-events-none" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white text-center mb-2">{getStepTitle()}</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        {step === 1 && "Şifre sıfırlama kodunu almak için e-posta adresinizi girin."}
                        {step === 2 && "E-postanıza gönderilen 6 haneli kodu girin."}
                        {step === 3 && "Hesabınız için yeni şifrenizi belirleyin."}
                    </p>
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                    <div className="relative space-y-4">
                        <Input
                            label="E-posta Adresi"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            icon={Mail}
                        />
                        <button
                            onClick={handleSendCode}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg border border-[#D3A625]/20 hover:shadow-[#740001]/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#D3A625] border-t-transparent rounded-full animate-spin" />
                                    <span>Gönderiliyor...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 text-[#D3A625]" />
                                    <span>Doğrulama Kodu Gönder</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <div className="relative space-y-4">
                        <p className="text-[#D3A625] text-sm mb-4 px-4 py-2 bg-[#740001]/20 rounded-lg border border-[#D3A625]/20">
                            📧 {email}
                        </p>
                        <div className="flex justify-center mb-6">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={handleChangeOTPCodeInput}
                                containerClassName="justify-center gap-2"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} inputMode="numeric" className="w-12 h-12 text-2xl bg-[#12131a] border-[#740001]/30 text-white focus:border-[#D3A625] focus:ring-[#D3A625]/30" />
                                    <InputOTPSlot index={1} inputMode="numeric" className="w-12 h-12 text-2xl bg-[#12131a] border-[#740001]/30 text-white focus:border-[#D3A625] focus:ring-[#D3A625]/30" />
                                    <InputOTPSlot index={2} inputMode="numeric" className="w-12 h-12 text-2xl bg-[#12131a] border-[#740001]/30 text-white focus:border-[#D3A625] focus:ring-[#D3A625]/30" />
                                </InputOTPGroup>
                                <InputOTPSeparator className="text-[#D3A625]" />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} inputMode="numeric" className="w-12 h-12 text-2xl bg-[#12131a] border-[#740001]/30 text-white focus:border-[#D3A625] focus:ring-[#D3A625]/30" />
                                    <InputOTPSlot index={4} inputMode="numeric" className="w-12 h-12 text-2xl bg-[#12131a] border-[#740001]/30 text-white focus:border-[#D3A625] focus:ring-[#D3A625]/30" />
                                    <InputOTPSlot index={5} inputMode="numeric" className="w-12 h-12 text-2xl bg-[#12131a] border-[#740001]/30 text-white focus:border-[#D3A625] focus:ring-[#D3A625]/30" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        {loading && (
                            <div className="flex items-center justify-center space-x-2 text-[#D3A625]">
                                <div className="w-5 h-5 border-2 border-[#D3A625] border-t-transparent rounded-full animate-spin" />
                                <span>Doğrulanıyor...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <div className="relative space-y-4">
                        <p className="text-[#D3A625] text-sm mb-4 px-4 py-2 bg-[#740001]/20 rounded-lg border border-[#D3A625]/20">
                            ✓ {email} doğrulandı
                        </p>

                        <Input
                            label="Yeni Şifre"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Yeni şifrenizi girin"
                            icon={Lock}
                        />
                        <Input
                            label="Yeni Şifre (Tekrar)"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Yeni şifrenizi tekrar girin"
                            icon={Lock}
                        />
                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg border border-[#D3A625]/20 hover:shadow-[#740001]/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#D3A625] border-t-transparent rounded-full animate-spin" />
                                    <span>Sıfırlanıyor...</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5 text-[#D3A625]" />
                                    <span>Şifreyi Sıfırla</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Back to login */}
                <div className="relative text-center mt-6">
                    <button
                        onClick={onBackToLogin}
                        className="text-[#D3A625] hover:text-[#EEBA30] transition-all flex items-center justify-center space-x-2 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Giriş sayfasına dön</span>
                    </button>
                </div>

                {alert.type && <AlertBox type={alert.type} title={alert.title} message={typeof alert.message === 'string' ? alert.message : undefined} />}
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
