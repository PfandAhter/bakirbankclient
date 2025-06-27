'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button }from '@/app/components/ui/Button';
import { useAuthStore } from "@/app/lib/store/authStore";
import { Mail, Lock, Eye, EyeOff, User, UserCheck } from 'lucide-react';

export default function Register() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [errors, setErrors] = useState<{
        username?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        firstName?: string;
        lastName?: string;
    }>({});
    const [formError, setFormError] = useState<string | null>(null);

    const { register, isLoading } = useAuthStore();

    const handleNavigateToLogin = () => {
        router.push('/auth/login');
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.username) {
            newErrors.username = 'Kullanıcı adı gereklidir';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
        }

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

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifre doğrulaması gereklidir';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }

        if (!formData.firstName) {
            newErrors.firstName = 'Ad gereklidir';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'Ad en az 2 karakter olmalıdır';
        }

        if (!formData.lastName) {
            newErrors.lastName = 'Soyad gereklidir';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Soyad en az 2 karakter olmalıdır';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (validateForm()) {
            try {
                await register(formData);
            } catch {
                setFormError('Kayıt oluşturulamadı, lütfen tekrar deneyin.');
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
        <div className="min-h-screen bg-[#082c30] flex items-center justify-center p-4">
            <div className="w-full max-w-3xl mx-auto bg-black rounded-2xl shadow-dark-lg border border-dark-800 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-white text-4xl font-bold mb-2">
                        <span className="text-primary-500">Bakir Web Service</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Kayıt Ol</h1>
                    <p className="text-gray-400">Yeni hesap oluşturun</p>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı Adı</label>
                        <div className="relative">
                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white ${errors.username ? 'border-red-500' : 'border-gray-600'}`}
                                placeholder="Kullanıcı adınızı giriniz"
                            />
                        </div>
                        {errors.username && <p className="text-sm text-red-400 mt-1">{errors.username}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white ${errors.email ? 'border-red-500' : 'border-gray-600'}`}
                                placeholder="E-posta adresinizi giriniz"
                            />
                        </div>
                        {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                    </div>

                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Ad</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white ${errors.firstName ? 'border-red-500' : 'border-gray-600'}`}
                                placeholder="Adınızı giriniz"
                            />
                        </div>
                        {errors.firstName && <p className="text-sm text-red-400 mt-1">{errors.firstName}</p>}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Soyad</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white ${errors.lastName ? 'border-red-500' : 'border-gray-600'}`}
                                placeholder="Soyadınızı giriniz"
                            />
                        </div>
                        {errors.lastName && <p className="text-sm text-red-400 mt-1">{errors.lastName}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white ${errors.password ? 'border-red-500' : 'border-gray-600'}`}
                                placeholder="Şifrenizi giriniz"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Şifreyi Doğrula</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'}`}
                                placeholder="Şifrenizi tekrar giriniz"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>}
                    </div>
                </div>

                {/* Hata mesajı */}
                {formError && <p className="text-sm text-red-400 mb-4 text-center">{formError}</p>}

                {/* Kayıt butonu */}
                <Button size={"login"} onClick={handleSubmit} ringColor={"black"} ringThickness={"4"} loading={isLoading}>Kayıt Ol</Button>

                {/* Divider */}
                <div className="my-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-black text-white">veya</span>
                    </div>
                </div>

                {/* Google ile Kayıt */}
                <Button size={"login"} variant={"google"} ringColor={"black"} ringThickness={"4"}>

                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google ile Kayıt Ol
                </Button>

                {/* Giriş yap linki */}
                <div className="text-center mt-6">
                    <p className="text-gray-400">
                        Zaten hesabınız var mı?{' '}
                        <button
                            onClick={handleNavigateToLogin}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Giriş Yap
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
