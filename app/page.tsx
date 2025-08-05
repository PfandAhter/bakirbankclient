'use client';

import { useAuth } from '@/app/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {User, Settings, BarChart3, CreditCard, Landmark, LogOut, RefreshCw} from 'lucide-react';
import {useEffect, useState} from "react";

export default function HomePage() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        debugger;
        console.log('DashboardPage useEffect triggered and isAuthenticated:', isAuthenticated);

        // Simulate API loading
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, [user, router]);


    const handleProtectedAction = (path: string) => {
        console.log('Authenticated info:', isAuthenticated);
        if (isAuthenticated) {
            // Kullanıcı giriş yapmışsa direkt yönlendir
            router.push(path);
        } else {
            // Giriş yapmamışsa, gitmek istediği yeri sessionStorage'a kaydet ve login'e yönlendir
            const redirectUrl = encodeURIComponent(path);
            router.push(`/sign-in?redirect=${redirectUrl}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">Ana sayfa yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Header */}
            <header className="bg-black/50 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Landmark className="h-8 w-8 text-blue-400" />
                            <h1 className="ml-2 text-2xl font-bold text-white">BAKIRBANK</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            { isAuthenticated ? (
                                <div className="flex items-center space-x-4">
                                    {/* Kullanıcı bilgileri */}
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-medium">{"ATABERK TEST"}</p>
                                            <p className="text-gray-400 text-sm">{"USEER.EMAIL TEST"}</p>
                                        </div>
                                    </div>

                                    {/* Dashboard buton */}
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </button>

                                    {/* Çıkış butonu */}
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Çıkış</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-x-2">
                                    <button
                                        onClick={() => router.push('/sign-in')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Giriş Yap
                                    </button>
                                    <button
                                        onClick={() => router.push('/sign-up')}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Kayıt Ol
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-5xl font-bold text-white mb-6">
                        {isAuthenticated ? (
                            <>
                                Hoş geldin, <span className="text-blue-400">{"USERNAME TEST"}</span>
                            </>
                        ) : (
                            <>
                                Modern Bankacılığın
                                <span className="text-blue-400"> Geleceği</span>
                            </>
                        )}
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                        {isAuthenticated ? (
                            "Finansal durumunuzu kontrol edin, işlemlerinizi yönetin ve hedeflerinize ulaşın."
                        ) : (
                            "Güvenli, hızlı ve kullanıcı dostu bankacılık deneyimi için tek ihtiyacınız olan platform. Finansal hedeflerinize ulaşmak için gerekli tüm araçları sunuyoruz."
                        )}
                    </p>

                    {/* Giriş yapmış kullanıcılar için hızlı erişim */}
                    {isAuthenticated && (
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center space-x-2"
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span>Dashboard`a Git</span>
                            </button>
                            <button
                                onClick={() => router.push('/transactions')}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center space-x-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                <span>İşlemler</span>
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-white mb-4">
                            {isAuthenticated ? "Hesap Yönetimi" : "Özellikler"}
                        </h3>
                        <p className="text-gray-400">
                            {isAuthenticated ? "Hesabınızı yönetmek için gerekli tüm araçlar" : "Size sunduğumuz bankacılık hizmetleri"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Dashboard Card */}
                        <div
                            onClick={() => handleProtectedAction('/dashboard')}
                            className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Dashboard</h3>
                            <p className="text-gray-400">Hesap özetinizi ve finansal durumunuzu görüntüleyin</p>
                            {isAuthenticated && (
                                <div className="mt-3 text-green-400 text-sm font-medium">
                                    ✓ Erişim sağlandı
                                </div>
                            )}
                        </div>

                        {/* Profile Card */}
                        <div
                            onClick={() => handleProtectedAction('/profile')}
                            className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Profil</h3>
                            <p className="text-gray-400">Kişisel bilgilerinizi yönetin ve güncelleyin</p>
                            {isAuthenticated && (
                                <div className="mt-3 text-green-400 text-sm font-medium">
                                    ✓ Erişim sağlandı
                                </div>
                            )}
                        </div>

                        {/* Transactions Card */}
                        <div
                            onClick={() => handleProtectedAction('/transactions')}
                            className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">İşlemler</h3>
                            <p className="text-gray-400">Para transferi yapın ve işlem geçmişinizi görün</p>
                            {isAuthenticated && (
                                <div className="mt-3 text-green-400 text-sm font-medium">
                                    ✓ Erişim sağlandı
                                </div>
                            )}
                        </div>

                        {/* Settings Card */}
                        <div
                            onClick={() => handleProtectedAction('/settings')}
                            className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Ayarlar</h3>
                            <p className="text-gray-400">Hesap ayarlarınızı ve güvenlik seçeneklerinizi yönetin</p>
                            {isAuthenticated && (
                                <div className="mt-3 text-green-400 text-sm font-medium">
                                    ✓ Erişim sağlandı
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Sadece giriş yapmamış kullanıcılar için */}
            {!isAuthenticated && (
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-3xl font-bold text-white mb-6">
                            Hemen Başlayın
                        </h3>
                        <p className="text-lg text-gray-300 mb-8">
                            Ücretsiz hesap oluşturun ve modern bankacılık deneyimini yaşamaya başlayın.
                        </p>
                        <div className="space-x-4">
                            <button
                                onClick={() => router.push('/sign-up')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                            >
                                Ücretsiz Kayıt Ol
                            </button>
                            <button
                                onClick={() => router.push('/sign-in')}
                                className="bg-transparent border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                            >
                                Giriş Yap
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}