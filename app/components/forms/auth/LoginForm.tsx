'use client';

import React, {useState} from 'react';
import {useAuth} from '@/app/lib/hooks/useAuth';
import {Input} from '@/app/components/ui/Input';
import {Button} from '@/app/components/ui/Button';
import {Mail, Lock, Eye, EyeOff, User} from 'lucide-react';

const LoginForm = ({
                       onSwitchToRegister,
                       onSuccessfulLogin
                   }: {
    onSwitchToRegister?: () => void;
    onSuccessfulLogin?: () => void;
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({email: '', password: ''});
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [formError, setFormError] = useState<string | null>(null);

    const {login, isLoading, error} = useAuth();

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        /*if (!formData.email) {
            newErrors.email = 'E-posta adresi gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır';
        }*/

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (validateForm()) {
            try {
                console.log('Test giris basarizi error code:', error);
                await login(formData.email, formData.password);
                onSuccessfulLogin?.(); // Başarılı login sonrası callback
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
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div
                            className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center border border-green-700">
                            <User className="w-8 h-8 text-green-400"/>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">BAKIRBANK`a Hoş Geldiniz</h1>
                    <p className="text-gray-400">Hesabınıza giriş yapın</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="relative">
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
                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                        </button>
                    </div>

                    {/* Remember me & forgot password */}
                    <div className="flex items-center justify-between mb-6 mt-6">
                        <label className="flex items-center cursor-pointer select-none relative">
                            <input
                                type="checkbox"
                                className="peer appearance-none h-5 w-5 border border-gray-500 bg-gray-800 rounded transition-colors checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-400">Beni hatırla</span>
                            <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-white hidden peer-checked:block pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                        </label>
                        <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            Şifremi unuttum
                        </a>
                    </div>

                    {/* Error messages */}
                    {formError && <p className="text-sm text-red-400 mb-4 text-center">{formError}</p>}
                    {error && <p className="text-sm text-red-400 mb-4 text-center">{error}</p>}

                    {/* Submit Button */}
                    <Button type="submit" loading={isLoading} size={'login'}>
                        Giriş Yap
                    </Button>
                </form>

                {/* Divider */}
                <div className="my-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"/>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-900 text-gray-500">veya</span>
                        </div>
                    </div>
                </div>

                {/* Google Login */}
                <button
                    type="button"
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
                >
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
                </button>

                {/* Register Link */}
                <div className="text-center mt-6">
                    <p className="text-gray-400">
                        Hesabınız yok mu?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Kayıt Ol
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;