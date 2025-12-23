'use client';

import React, {useState, useEffect, useRef} from 'react';
import {InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator} from '@/components/ui/input-otp';
import {Button} from '@/src/components/ui/Button';
import {useAlert} from '@/src/hooks/notification/useAlert';
import AlertBox from "@/src/components/ui/notification/AlertBox";

interface OTPVerificationModalProps {
    userEmail: string;
    onVerified: () => void;
    onCancel: () => void;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
                                                                       userEmail,
                                                                       onVerified,
                                                                       onCancel,
                                                                   }) => {
    const [otpValue, setOtpValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 dakika = 600 saniye
    const [resendDisabled, setResendDisabled] = useState(false);
    const {alert, showAlert} = useAlert();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Sayaç başlatma
    useEffect(() => {
        startTimer();
        return () => stopTimer();
    }, []);

    const startTimer = () => {
        stopTimer(); // önce varsa eskiyi temizle
        setTimeLeft(600);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const routeAfterSuccessRegister = () => {
        onVerified();
    }

    const routeAfterCancelRegister = () => {
        onCancel();
    }

    // OTP 6 hane olunca otomatik doğrulama
    const handleChange = async (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        setOtpValue(numericValue);
        if (numericValue.length === 6) {
            setLoading(true);
            try {
                const response = await fetch(`/api/account/user/otp/verify`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({otp: numericValue, email: userEmail}),
                });

                if (!response.ok) throw new Error('OTP doğrulama başarısız.');

                showAlert('success', 'Doğrulama Başarılı', 'Hesabınız aktif hale getirildi.');
                setTimeout(() => {
                    routeAfterSuccessRegister();
                }, 3000); // 3 saniye bekle

                //showAlert('success', 'Doğrulama Başarılı', 'Hesabınız aktif hale getirildi.');
            } catch (error: any) {
                showAlert('destructive', 'Hata', error.message || 'OTP doğrulama başarısız.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        try {
            await fetch(`/api/account/user/otp/cancel`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: userEmail}),
            });

            showAlert('destructive', 'Kayıt İptal Edildi', 'Hesabınız silindi.');

            setTimeout(() => {
                routeAfterCancelRegister();
            }, 4000); // 3 saniye bekle
        } catch (err: any) {
            showAlert('destructive', 'Hata', err.message || 'İptal işlemi başarısız.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setResendDisabled(true);
        try {
            const response = await fetch(`/api/account/user/otp/resend`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: userEmail}),
            });

            if (!response.ok) throw new Error('Kod yeniden gönderilemedi.');

            showAlert('success', 'Kod Gönderildi', 'Yeni OTP kodu e-posta adresinize gönderildi.');

            // Sayaç sıfırla ve yeniden başlat
            startTimer();
        } catch (err: any) {
            showAlert('destructive', 'Hata', err.message || 'Kod yeniden gönderilemedi.');
        } finally {
            setLoading(false);
            // 10 dakika boyunca yeniden gönder butonu pasif
            setTimeout(() => setResendDisabled(false), 600000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Email Doğrulama</h2>
                <p className="text-gray-400 mb-6">
                    Lütfen {userEmail} adresinize gönderilen 6 haneli kodu giriniz.
                </p>

                {/* Geri Sayım */}
                <p className="text-sm text-gray-400 mb-4">
                    {timeLeft > 0
                        ? `Kodun süresi: ${formatTime(timeLeft)}`
                        : 'Süre doldu, yeniden kod gönderin.'}
                </p>

                {/* OTP Girişi */}
                <div className="flex justify-center mb-6">
                    <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={handleChange}
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

                {/* Butonlar */}
                <div className="space-y-3 mt-6">
                    <Button
                        onClick={handleCancel}
                        variant="destructive"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? 'İşlem yapılıyor...' : 'İptal Et'}
                    </Button>

                    <Button
                        onClick={handleResend}
                        disabled={resendDisabled || loading}
                        className={`w-full ${
                            resendDisabled
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                    >
                        {resendDisabled
                            ? 'Yeniden Gönder (10 dk sonra aktif olur)'
                            : 'Kodu Yeniden Gönder'}
                    </Button>
                </div>
            </div>
            <AlertBox type={alert.type} title={alert.title} message={alert.message}/>
        </div>
    );
};

export default OTPVerificationModal;
