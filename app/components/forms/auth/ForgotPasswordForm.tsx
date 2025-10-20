'use client';

import React, { useState } from "react";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { useAlert } from "@/app/lib/hooks/useAlert";
import AlertBox from "@/components/modals/AlertBox";
import {InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator} from '@/components/ui/input-otp';

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

        try{
            await fetch(`/api/auth/password/send-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email:email }),
            });

            showAlert("success", "Kod Gönderildi", "E-postanıza doğrulama kodu gönderildi.");
            setStep(2);
        }catch(error: any){
            showAlert("destructive", "Hata", error.message || "Kod gönderilemedi.");
        }finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            return showAlert("destructive", "Hata", "Şifreler eşleşmiyor.");
        }
        try{
            await fetch(`/api/auth/password/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, confirmPassword}),
            });

            showAlert("success", "Şifre Yenilendi", "Yeni şifrenizle giriş yapabilirsiniz.");
            onBackToLogin();
        }catch(error: any){
            showAlert("destructive", "Hata", error.message || "Şifre sıfırlanamadı.");
        }finally {
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
                },1000);
            } catch (error: any) {
                showAlert('destructive', 'Hata', error.message || 'Kod doğrulama başarısız.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center text-white">
                <h1 className="text-3xl font-bold text-white text-center mb-6">BAKIRBANK</h1>
                <h2 className="text-xl font-bold text-white text-center mb-6">Şifremi Unuttum</h2>

                {step === 1 && (
                    <>
                        <Input
                            label="E-posta Adresi"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                        />
                        <Button
                            onClick={handleSendCode}
                            className="w-full mt-4 h-12"
                            disabled={loading}
                        >
                            Doğrulama Kodu Gönder
                        </Button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p className="text-gray-400 mb-6">
                            {email} adresine gönderilen 6 haneli doğrulama kodunu girin.
                        </p>
                        <div className="flex justify-center mb-6">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={handleChangeOTPCodeInput}
                                containerClassName="justify-center gap-3"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} inputMode="numeric" className="w-12 h-12 text-2xl"/>
                                    <InputOTPSlot index={1} inputMode="numeric" className="w-12 h-12 text-2xl"/>
                                    <InputOTPSlot index={2} inputMode="numeric" className="w-12 h-12 text-2xl"/>
                                </InputOTPGroup>
                                <InputOTPSeparator/>
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} inputMode="numeric" className="w-12 h-12 text-2xl"/>
                                    <InputOTPSlot index={4} inputMode="numeric" className="w-12 h-12 text-2xl"/>
                                    <InputOTPSlot index={5} inputMode="numeric" className="w-12 h-12 text-2xl"/>
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <p className="text-gray-400 mb-6">
                            {email} adresiniz için yeni şifrenizi belirleyin.
                        </p>

                        <Input
                            label="Yeni Şifre"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Yeni şifrenizi girin"
                        />
                        <Input
                            label="Yeni Şifre (Tekrar)"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Yeni şifrenizi tekrar girin"
                        />
                        <Button
                            onClick={handleResetPassword}
                            className="w-full h-12"
                            disabled={loading}
                        >
                            Şifreyi Sıfırla
                        </Button>
                    </div>
                )}

                <div className="text-center mt-4">
                    <button
                        onClick={onBackToLogin}
                        className="text-blue-400 hover:text-blue-300 transition"
                    >
                        Giriş sayfasına dön
                    </button>
                </div>

                <AlertBox type={alert.type} title={alert.title} message={alert.message} />
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
