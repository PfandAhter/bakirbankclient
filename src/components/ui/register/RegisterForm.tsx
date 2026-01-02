import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from '@/src/hooks/login/useAuth';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAlert } from "@/src/hooks/notification/useAlert";
import AlertBox from "@/src/components/ui/notification/AlertBox";
import OTPVerificationModal from "@/src/components/ui/register/OTPVerificationModal";
import TermsAndPrivacyModal from '@/src/components/ui/register/TermsAndPrivacyModal';


const RegisterForm = ({
    onSwitchToLogin,
    onSuccessfulRegister
}: {
    onSwitchToLogin?: () => void;
    onSuccessfulRegister?: () => void;
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gsm: '',
        password: '',
        confirmPassword: '',
        terms: false
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { register, isLoading } = useAuth();
    const { alert, showAlert } = useAlert();

    const [showOTPModal, setShowOTPModal] = useState(false);
    const [registeredUserEmail, setRegisteredUserEmail] = useState<string | null>();


    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#+_\$%\^&\*]).{8,}$/;

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name) {
            newErrors.name = 'Ad Soyad gereklidir';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Ad Soyad en az 2 karakter olmalıdır';
        }

        if (!formData.email) {
            newErrors.email = 'E-posta adresi gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        if (!formData.gsm) {
            newErrors.phone = 'Telefon numarası gereklidir';
        } else if (!/^[0-9]{10,10}$/.test(formData.gsm.replace(/\s/g, ''))) {
            newErrors.phone = 'Geçerli bir telefon numarası giriniz';
        }

        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Şifre en az 8 karakter olmalı, büyük/küçük harf, sayı ve özel karakter içermelidir';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }

        if (!formData.terms) {
            newErrors.terms = 'Kullanım koşullarını kabul etmelisiniz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const routeAfterSuccessRegister = () => {
        showAlert('success', 'Doğrulama Başarılı', 'Hesabınız aktif hale getirildi.');
        setTimeout(() => {
            routeLoginPage();
        }, 10);
    }

    const routeLoginPage = () => {
        onSuccessfulRegister?.();
        onSwitchToLogin?.();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                await register(formData);
                setRegisteredUserEmail(formData.email);
                setShowOTPModal(true);
                showAlert("success",
                    "Kayıt Başarılı",
                    "Kullanıcı kaydınız başarıyla oluşturuldu. Email doğrulaması gerekmektedir.");

            } catch (error: any) {
                showAlert(
                    "destructive",
                    "Kayıt Başarısız",
                    error.message || "Bir hata oluştu, lütfen tekrar deneyin."
                );

            }

        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (name === "gsm") {
            const numericValue = value.replace(/\D/g, "");
            if (numericValue.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Gryffindor ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#740001]/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D3A625]/8 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="relative w-full max-w-md mx-auto bg-[#0f1015]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#740001]/30 p-8">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#740001]/5 to-transparent pointer-events-none" />

                {showOTPModal && registeredUserEmail && (
                    <OTPVerificationModal
                        userEmail={registeredUserEmail}
                        onVerified={() => {
                            setShowOTPModal(false);
                            routeAfterSuccessRegister();
                        }}
                        onCancel={() => setShowOTPModal(false)}
                    />
                )}

                {/* Header */}
                <div className="relative text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="relative w-16 h-16 bg-gradient-to-br from-[#740001] to-[#5C0001] rounded-full flex items-center justify-center border-2 border-[#D3A625]/30 shadow-lg">
                            <User className="w-8 h-8 text-[#D3A625]" />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D3A625]/10 to-transparent pointer-events-none" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Hesap <span className="text-[#D3A625]">Oluştur</span>
                    </h1>
                    <p className="text-gray-400">Hemen üye olun</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="relative space-y-4">
                    <Input
                        label="Ad Soyad"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        icon={User}
                        placeholder="Adınız ve soyadınız (Lütfen aralarında boşluk bırakın)"
                        error={errors.name}
                    />

                    <Input
                        label="E-posta Adresi"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        icon={Mail}
                        placeholder="ornek@email.com"
                        error={errors.email}
                    />

                    <Input
                        label="Telefon Numarası"
                        type="tel"
                        name="gsm"
                        value={formData.gsm}
                        onChange={handleChange}
                        icon={Phone}
                        placeholder="5XX XXX XX XX"
                        error={errors.phone}
                    />

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Şifre
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                autoComplete={"new-password"}
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 border bg-[#12131a] text-white rounded-lg focus:ring-2 focus:ring-[#D3A625]/50 focus:border-[#D3A625]/50 outline-none transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-[#740001]/30'}`}
                                placeholder="Şifrenizi giriniz"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#D3A625] transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-400 mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Şifre Tekrarı
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                autoComplete={"new-password"}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 border bg-[#12131a] text-white rounded-lg focus:ring-2 focus:ring-[#D3A625]/50 focus:border-[#D3A625]/50 outline-none transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-[#740001]/30'}`}
                                placeholder="Şifrenizi tekrar giriniz"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#D3A625] transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Terms Checkbox */}
                    <div className="space-y-2">
                        <label className="flex items-start">
                            <input
                                type="checkbox"
                                name="terms"
                                checked={formData.terms}
                                onChange={handleChange}
                                className="h-4 w-4 text-[#740001] focus:ring-[#D3A625]/50 bg-[#12131a] border-[#740001]/50 rounded mt-1 checked:bg-[#740001]"
                            />
                            <span className="ml-2 text-sm text-gray-400">
                                <button
                                    type="button"
                                    onClick={() => setModalType('terms')}
                                    className="text-[#D3A625] hover:text-[#EEBA30] underline"
                                >
                                    Kullanım Koşulları
                                </button>{' '}
                                ve{' '}
                                <button
                                    type="button"
                                    onClick={() => setModalType('privacy')}
                                    className="text-[#D3A625] hover:text-[#EEBA30] underline"
                                >
                                    Gizlilik Politikası
                                </button>
                                'nı okudum ve kabul ediyorum.
                            </span>
                        </label>
                        {errors.terms && (
                            <p className="text-sm text-red-400">{errors.terms}</p>
                        )}
                    </div>

                    {/* Submit Button - Gryffindor Theme */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg border border-[#D3A625]/20 hover:shadow-[#740001]/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-[#D3A625] border-t-transparent rounded-full animate-spin" />
                                <span>Hesap Oluşturuluyor...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 text-[#D3A625]" />
                                <span>Hesap Oluştur</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6 relative">
                    <p className="text-gray-400">
                        Zaten hesabınız var mı?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-[#D3A625] hover:text-[#EEBA30] font-medium transition-colors"
                        >
                            Giriş Yap
                        </button>
                    </p>
                </div>
            </div>

            {modalType && (
                <TermsAndPrivacyModal
                    type={modalType}
                    onClose={() => setModalType(null)}
                />
            )}

            {alert.type && <AlertBox type={alert.type} title={alert.title} message={typeof alert.message === 'string' ? alert.message : undefined} />}
        </div>
    );
};

export default RegisterForm;