import {Eye, EyeOff, Mail, Lock, User, Phone} from "lucide-react";
import React, {useState} from "react";
import {useAuth} from '@/src/hooks/login/useAuth';
import {Input} from '@/src/components/ui/Input';
import {Button} from '@/src/components/ui/Button';
import {useAlert} from "@/src/hooks/notification/useAlert";
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
    const {register, isLoading} = useAuth();
    const {alert, showAlert} = useAlert();

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
        }, 10); // 3 saniye bekle
    }

    const routeLoginPage = () => {
        onSuccessfulRegister?.(); // Başarılı kayıt sonrası callback
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
                    "Registration Failed",
                    <>
                        <p>{error.message}</p>
                        <ul className="list-inside list-disc text-sm mt-1">
                            <li>Invalid email or password</li>
                            <li>Email may in usage</li>
                            <li>Please try again</li>
                        </ul>
                    </>
                );

            }

        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        if (name === "gsm") {
            const numericValue = value.replace(/\D/g, "");
            if (numericValue.length <= 10) {
                setFormData(prev => ({...prev, [name]: numericValue}));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">

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
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div
                            className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center border border-green-700">
                            <User className="w-8 h-8 text-green-400"/>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Hesap Oluştur</h1>
                    <p className="text-gray-400">Hemen üye olun</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                autoComplete={"new-password"}
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 border bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'}`}
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
                        {errors.password && (
                            <p className="text-sm text-red-400 mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Şifre Tekrarı
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                autoComplete={"new-password"}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 border bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'}`}
                                placeholder="Şifrenizi tekrar giriniz"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
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
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-gray-800 border-gray-600 rounded mt-1"
                            />
                            <span className="ml-2 text-sm text-gray-400">
      <button
          type="button"
          onClick={() => setModalType('terms')}
          className="text-blue-400 hover:text-blue-300 underline"
      >
        Kullanım Koşulları
      </button>{' '}
                                ve{' '}
                                <button
                                    type="button"
                                    onClick={() => setModalType('privacy')}
                                    className="text-blue-400 hover:text-blue-300 underline"
                                >
        Gizlilik Politikası
      </button>
      `nı okudum ve kabul ediyorum.
    </span>
                        </label>
                        {errors.terms && (
                            <p className="text-sm text-red-400">{errors.terms}</p>
                        )}
                    </div>


                    <Button type="submit" loading={isLoading} size={'login'}>
                        Hesap Oluştur
                    </Button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6">
                    <p className="text-gray-400">
                        Zaten hesabınız var mı?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
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

            <AlertBox type={alert.type} title={alert.title} message={alert.message}/>
        </div>
    );
};

export default RegisterForm;