'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/src/hooks/login/useAuth';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAlert } from "@/src/hooks/notification/useAlert";
import AlertBox from "@/src/components/ui/notification/AlertBox";
import { Mail, Lock, Eye, EyeOff, User, Shield, Sparkles } from 'lucide-react';
import ForgotPasswordForm from "@/src/components/ui/login/ForgotPasswordForm";

const LoginForm = ({
    onSwitchToRegister,
    onSuccessfulLogin
}: {
    onSwitchToRegister?: () => void;
    onSuccessfulLogin?: () => void;
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const { login, isLoading, error } = useAuth();
    const [loginAttempted, setLoginAttempted] = useState(false);
    const { alert, showAlert } = useAlert();

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!formData.email) {
            newErrors.email = 'E-posta adresi gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setLoginAttempted(true);

        if (validateForm()) {
            try {
                await login(formData.email, formData.password);
                showAlert("success",
                    "Login Successful",
                    "You have successfully logged in.");

                onSuccessfulLogin?.();
            } catch (error: any) {

                showAlert(
                    "destructive",
                    "Giriş Başarısız",
                    error.message || "E-posta veya şifre hatalı."
                );
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Gryffindor ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#740001]/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#D3A625]/8 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="relative w-full max-w-md mx-auto bg-[#0f1015]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#740001]/30 p-8">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#740001]/5 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="relative text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="relative w-16 h-16 bg-gradient-to-br from-[#740001] to-[#5C0001] rounded-full flex items-center justify-center border-2 border-[#D3A625]/30 shadow-lg">
                            <Shield className="w-8 h-8 text-[#D3A625]" />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D3A625]/10 to-transparent pointer-events-none" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        <span className="text-[#D3A625]">BAKIR</span>BANK'a Hoş Geldiniz
                    </h1>
                    <p className="text-gray-400">Hesabınıza giriş yapın</p>
                </div>

                {showForgotPassword && (
                    <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
                )}

                <form onSubmit={handleSubmit} className="relative space-y-4">
                    <fieldset disabled={isLoading} className={isLoading ? "opacity-50 cursor-not-allowed" : ""}>
                        {/* Email Input */}
                        <Input
                            label="E-posta Adresi"
                            type="username"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            icon={Mail}
                            placeholder="ornek@email.com"
                            error={errors.email}
                        />

                        {/* Password Input */}
                        <div className="relative mt-4">
                            <Input
                                label="Şifre"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                icon={Lock}
                                placeholder="Şifrenizi giriniz"
                                error={errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-3 top-9 text-gray-400 hover:text-[#D3A625] transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Remember me & forgot password */}
                        <div className="flex items-center justify-between mb-6 mt-6">
                            <label className="flex items-center cursor-pointer select-none relative">
                                <input
                                    type="checkbox"
                                    disabled={isLoading}
                                    className="peer appearance-none h-5 w-5 border border-[#740001]/50 bg-[#12131a] rounded transition-colors checked:bg-[#740001] checked:border-[#D3A625] focus:ring-2 focus:ring-[#D3A625]/30"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-400">Beni hatırla</span>
                                <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-[#D3A625] hidden peer-checked:block pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </label>

                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                disabled={isLoading}
                                className="text-sm text-[#D3A625] hover:text-[#EEBA30] transition-colors"
                            >
                                Şifremi unuttum
                            </button>
                        </div>

                        {/* Error messages */}
                        {formError && <p className="text-sm text-red-400 mb-4 text-center">{formError}</p>}
                        {error && <p className="text-sm text-red-400 mb-4 text-center">{error}</p>}

                        {/* Submit Button - Gryffindor Theme */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg border border-[#D3A625]/20 hover:shadow-[#740001]/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#D3A625] border-t-transparent rounded-full animate-spin" />
                                    <span>Giriş Yapılıyor...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 text-[#D3A625]" />
                                    <span>Giriş Yap</span>
                                </>
                            )}
                        </button>
                    </fieldset>
                </form>

                {/* Divider */}
                <div className="my-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#740001]/30" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#0f1015] text-gray-500">veya</span>
                    </div>
                </div>

                {/* Google Login */}
                <button
                    type="button"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-4 py-3 border border-[#740001]/30 bg-[#12131a] rounded-lg hover:bg-[#1a1b24] hover:border-[#D3A625]/30 transition-all text-gray-300"
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google ile Giriş Yap
                </button>

                {/* Register Link */}
                <div className="text-center mt-6 relative">
                    <p className="text-gray-400">
                        Hesabınız yok mu?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            disabled={isLoading}
                            className="text-[#D3A625] hover:text-[#EEBA30] font-medium transition-colors"
                        >
                            Kayıt Ol
                        </button>
                    </p>
                </div>
            </div>
            {alert.type && <AlertBox type={alert.type} title={alert.title} message={typeof alert.message === 'string' ? alert.message : undefined} />}
        </div>
    );
};

export default LoginForm;