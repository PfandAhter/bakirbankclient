'use client';

//import {Loader2Icon} from 'lucide-react';
import React, {useState} from 'react';
import { useRouter } from 'next/navigation';
//import {Button} from '@/components/ui/button';
//import {Input} from '@/components/ui/input';
//import Input  from '@/app/components/ui/Input';
import { Button }  from '@/src/components/ui/Button';
import {useAuthStore} from "@/src/hooks/login/authStore";
//import { Card } from './components/ui/Card';
import {Mail, Lock, Eye, EyeOff} from 'lucide-react';
//import { CardContent } from './components/ui/CardContent';

export default function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({email: '', password: ''});
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [formError, setFormError] = useState<string | null>(null);

    const {login, isLoading} = useAuthStore();

    const handleNavigateToRegister = () => {
        router.push('/auth/register');
    };

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

        if (validateForm()) {
            try {
                await login(formData.email, formData.password);
            } catch {
                setFormError('Giriş yapılamadı, lütfen tekrar deneyin.');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));

        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({...prev, [name]: ''}));
        }
    };

    return (
        <div className="min-h-screen bg-[#082c30] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-black rounded-2xl shadow-dark-lg border border-dark-800 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">

                        {/*<div className="w-16 h-16 bg-primary-900 rounded-full flex items-center justify-center border border-primary-700 animate-pulse-slow">
                {<ShoppingBag className="w-8 h-8 text-primary-400" />}
              </div>*/}
                        <div className={"text-white text-4xl font-bold mb-6 text-center tracking-wide"}>
                            <span className="text-primary-500"> Bakir Web Service</span>
                        </div>

                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h1>
                    <p className="text-gray-400">Hesabınıza giriş yapın</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6"> {/*Handle submit kisminda e.preventDefault oldugu icin burada direkt handleSubmit yapabiliriz...*/}
                    {/* Email Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder-gray-400 ${
                                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                                }`}
                                placeholder="E-posta adresinizi giriniz"
                            />
                        </div>
                        {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder-gray-400 ${
                                    errors.password ? 'border-red-500 focus:ring-red-500' : ''
                                }`}
                                placeholder="Şifrenizi giriniz"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
                    </div>

                    {/* Remember me & forgot password */}
                    <div className="flex items-center justify-between mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 bg-gray-800 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-400">Beni hatırla</span>
                        </label>
                        <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            Şifremi unuttum
                        </a>
                    </div>

                    {/* Error messages */}
                    {formError && <p className="text-sm text-red-400 mb-4 text-center">{formError}</p>}
                    {/*error && <p className="text-sm text-red-400 mb-4 text-center">{error}</p>*/}

                    {/* Submit Button */}
                    {<Button type="submit" variant={"primary"} size={"login"} ringColor={"black"} ringThickness={"4"} loading={isLoading}>
                        Giriş Yap
                    </Button>}

                </form>

                {/*<button type="button"
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 bg-[#330099] rounded-lg hover:bg-[#191970] transition-colors text-gray-300"
                        onClick={handleSubmit}
                >Giriş Yap</button>*/}

                {/*<Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading && <Loader2Icon className="animate-spin h-5 w-5 mr-2"/>}
                    Giriş Yap
                </Button>*/}

                {/* Divider */}
                <div className="my-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"/>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-black text-gray-500 text-white">veya</span>
                        </div>
                    </div>
                </div>

                {/* Google Login */}
                <Button variant={"google"} size={"login"} ringColor={"white"} ringThickness={"4"}>
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
                    Google ile Giriş Yap
                </Button>

                {/* Register Link */}
                <div className="text-center mt-6">
                    <p className="text-gray-400">
                        Hesabınız yok mu?{' '}
                        <button
                            onClick={handleNavigateToRegister}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Kayıt Ol
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
