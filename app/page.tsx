'use client';

import { useRouter } from 'next/navigation';
import {
    User,
    Settings,
    BarChart3,
    CreditCard,
    Landmark,
    LogOut,
    RefreshCw,
    MapPinned,
    Wallet,
    Shield,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationPanel from '@/src/components/ui/notification/NotificationPanel';
import { useAuth } from "@/src/hooks/login/useAuth";
import { useChat } from "@/src/hooks/useChat";
import { ChatWidget } from "@/src/components/ui/chat/ChatWidget";

export default function HomePage() {
    const { user, isAuthenticated, logout, checkAuth } = useAuth();
    const chat = useChat();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await checkAuth();
            } catch (error) {
                console.error('Error fetching current user:', error);
                router.push('/sign-in');
            } finally {
                setIsLoading(false);
            }
        };
        if (isAuthenticated && !user) fetchUser();
    }, [isAuthenticated]);

    const handleProtectedAction = (path: string) => {
        if (isAuthenticated) router.push(path);
        else {
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
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <RefreshCw className="w-10 h-10 text-[#D3A625] animate-spin mx-auto mb-4" />
                        <div className="absolute inset-0 w-10 h-10 mx-auto rounded-full bg-[#740001]/20 blur-xl animate-pulse" />
                    </div>
                    <p className="text-gray-300 text-base font-normal tracking-wide">Ana sayfa yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-[#0a0b0f] text-[#f8fafc] overflow-hidden">
            {/* Gryffindor-themed ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Subtle burgundy gradient overlay */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#740001]/8 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D3A625]/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-[#740001]/5 rounded-full blur-[80px]" />
            </div>

            {/* Bank logo watermark */}
            <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                    backgroundImage: "url('/bakirbank-transparent.png')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'top',
                    backgroundSize: '60%',
                }}
            />

            <div className="relative z-10">

                {isAuthenticated && (
                    <ChatWidget />
                )}

                {/* HEADER - Refined Gryffindor Theme */}
                <header className="bg-[#0c0d13]/90 border-b border-[#740001]/20 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center group cursor-pointer" onClick={() => router.push('/')}>
                            <div className="relative">
                                <Landmark className="h-6 w-6 sm:h-7 sm:w-7 text-[#D3A625] transition-all duration-300 group-hover:text-[#EEBA30]" />
                                <div className="absolute inset-0 bg-[#D3A625]/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <h1 className="ml-2 text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ transform: 'scaleY(1.3)', transformOrigin: 'center' }}>
                                <span className="text-[#D3A625]">BAKIR</span>BANK
                            </h1>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {isAuthenticated ? (
                                <div className="flex items-center space-x-2 sm:space-x-4">
                                    {/* User Info - Hidden on mobile */}
                                    <div className="hidden md:flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#740001] to-[#5C0001] rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#D3A625]/30">
                                            <User className="w-5 h-5 text-[#D3A625]" />
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-[15px] tracking-tight leading-tight text-white">
                                                {user?.firstName} {user?.secondName}{' '}
                                                <span className="font-bold text-[#D3A625]">{user?.lastName}</span>
                                            </p>
                                            <p className="text-gray-400 text-[13px] font-normal">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-all duration-300 shadow-md font-medium text-xs sm:text-sm border border-[#D3A625]/20"
                                    >
                                        <BarChart3 className="w-4 h-4 text-[#D3A625]" />
                                        <span className="hidden sm:inline">Dashboard</span>
                                    </button>

                                    <button
                                        onClick={() => router.push('/atmfinder')}
                                        className="hidden sm:flex bg-[#12131a] hover:bg-[#1a1b24] text-white px-4 py-2 rounded-lg items-center space-x-2 transition-all duration-300 font-medium text-sm border border-[#D3A625]/10 hover:border-[#D3A625]/30"
                                    >
                                        <MapPinned className="w-4 h-4 text-[#D3A625]" />
                                        <span>ATM Bul</span>
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="bg-[#740001]/80 hover:bg-[#740001] text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-all font-medium text-xs sm:text-sm border border-[#D3A625]/10"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="hidden sm:inline">Çıkış</span>
                                    </button>

                                    <NotificationPanel userId={user?.id || 'null'} />
                                </div>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => router.push('/sign-in')}
                                        className="bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all font-semibold text-xs sm:text-sm tracking-wide shadow-lg border border-[#D3A625]/20"
                                    >
                                        Giriş Yap
                                    </button>
                                    <button
                                        onClick={() => router.push('/sign-up')}
                                        className="hidden sm:block border border-[#D3A625]/40 text-[#D3A625] hover:bg-[#D3A625] hover:text-[#0a0b0f] px-5 py-2.5 rounded-lg transition-all font-semibold text-sm tracking-wide"
                                    >
                                        Kayıt Ol
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* HERO - Elegant Gryffindor Design */}
                <section className="py-12 sm:py-16 lg:py-24 text-center px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Decorative element */}
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center space-x-2 px-4 py-2 bg-[#740001]/10 rounded-full border border-[#D3A625]/20">
                                <Shield className="w-4 h-4 text-[#D3A625]" />
                                <span className="text-[#D3A625] text-sm font-medium">Güvenli Bankacılık</span>
                                <Sparkles className="w-4 h-4 text-[#D3A625]" />
                            </div>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
                            {isAuthenticated ? (
                                <>
                                    Hoş geldiniz,{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D3A625] to-[#EEBA30]">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                </>
                            ) : (
                                <>
                                    Finansın Gücü, <br className="sm:hidden" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D3A625] via-[#EEBA30] to-[#D3A625]">
                                        Güvenilir Geleceğiniz
                                    </span>
                                </>
                            )}
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-12 font-normal leading-relaxed px-2 max-w-2xl mx-auto">
                            {isAuthenticated
                                ? 'Hesaplarınızı yönetin, işlemlerinizi takip edin ve finansal hedeflerinize ulaşın.'
                                : 'Güvenli, hızlı ve modern bankacılık deneyimi için doğru adrestesiniz.'}
                        </p>

                        {isAuthenticated && (
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="group bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white px-6 sm:px-8 py-3 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all shadow-lg tracking-wide border border-[#D3A625]/20 hover:shadow-[#740001]/20 hover:shadow-xl"
                                >
                                    <BarChart3 className="w-5 h-5 text-[#D3A625] group-hover:animate-pulse" />
                                    <span>Dashboard'a Git</span>
                                </button>
                                <button
                                    onClick={() => router.push('/transactions')}
                                    className="bg-[#12131a] hover:bg-[#1a1b24] text-white px-6 sm:px-8 py-3 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all tracking-wide border border-[#D3A625]/10 hover:border-[#D3A625]/30"
                                >
                                    <CreditCard className="w-5 h-5 text-[#D3A625]" />
                                    <span>İşlemler</span>
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* FEATURE GRID - Gryffindor Cards */}
                <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8 sm:mb-12">
                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                                {isAuthenticated ? 'Hesap Yönetimi' : 'Özellikler'}
                            </h3>
                            <p className="text-gray-400 text-sm sm:text-base font-normal">
                                {isAuthenticated
                                    ? 'Bankacılığınızı tam kontrol altına alın'
                                    : 'Modern bankacılığın temel hizmetleri'}
                            </p>
                            {/* Decorative line */}
                            <div className="flex justify-center mt-4">
                                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D3A625] to-transparent rounded-full" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                            {[
                                {
                                    name: 'Dashboard',
                                    icon: <BarChart3 className="w-6 h-6 text-[#D3A625]" />,
                                    desc: 'Hesap özetinizi görüntüleyin',
                                    path: '/dashboard',
                                    delay: '0ms',
                                },
                                {
                                    name: 'Kartlarım',
                                    icon: <Wallet className="w-6 h-6 text-[#EEBA30]" />,
                                    desc: 'Kredi ve banka kartlarınız',
                                    path: '/cards',
                                    delay: '50ms',
                                },
                                {
                                    name: 'Profil',
                                    icon: <User className="w-6 h-6 text-[#D3A625]" />,
                                    desc: 'Kişisel bilgilerinizi yönetin',
                                    path: '/profile',
                                    delay: '100ms',
                                },
                                {
                                    name: 'İşlemler',
                                    icon: <CreditCard className="w-6 h-6 text-[#EEBA30]" />,
                                    desc: 'Para transferleri ve geçmiş',
                                    path: '/transactions',
                                    delay: '150ms',
                                },
                                {
                                    name: 'Ayarlar',
                                    icon: <Settings className="w-6 h-6 text-[#D3A625]" />,
                                    desc: 'Güvenlik ve hesap tercihleri',
                                    path: '/settings',
                                    delay: '200ms',
                                },
                            ].map((item) => (
                                <div
                                    key={item.name}
                                    onClick={() => handleProtectedAction(item.path)}
                                    className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#740001]/20 bg-gradient-to-br from-[#12131a] to-[#0a0b0f] cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:border-[#D3A625]/40 hover:shadow-lg hover:shadow-[#740001]/10"
                                    style={{ animationDelay: item.delay }}
                                >
                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#740001]/0 to-[#D3A625]/0 group-hover:from-[#740001]/5 group-hover:to-[#D3A625]/5 transition-all duration-500" />

                                    <div className="relative z-10">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#740001]/30 to-[#5C0001]/30 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-inner border border-[#D3A625]/10 group-hover:border-[#D3A625]/30">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2 tracking-tight group-hover:text-[#D3A625] transition-colors duration-300">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-400 text-xs sm:text-sm font-normal leading-relaxed hidden sm:block">{item.desc}</p>
                                        {isAuthenticated && (
                                            <p className="mt-3 text-[#D3A625] text-sm font-semibold tracking-wide flex items-center">
                                                <span className="w-2 h-2 bg-[#D3A625] rounded-full mr-2 animate-pulse" />
                                                Erişim sağlandı
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {!isAuthenticated && (
                    <section className="py-20 text-center px-6">
                        {/* Decorative divider */}
                        <div className="flex justify-center mb-12">
                            <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#740001]/50 to-transparent" />
                        </div>

                        <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">
                            Hemen <span className="text-[#D3A625]">Başlayın</span>
                        </h3>
                        <p className="text-gray-400 mb-8 text-base font-normal max-w-md mx-auto">
                            Ücretsiz hesap oluşturun ve modern bankacılığı deneyimleyin.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => router.push('/sign-up')}
                                className="group bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white px-8 py-3 rounded-xl font-semibold text-base transition-all tracking-wide shadow-lg border border-[#D3A625]/20 hover:shadow-[#740001]/30 hover:shadow-xl"
                            >
                                <span className="flex items-center justify-center space-x-2">
                                    <Sparkles className="w-5 h-5 text-[#D3A625] group-hover:animate-pulse" />
                                    <span>Ücretsiz Kayıt Ol</span>
                                </span>
                            </button>
                            <button
                                onClick={() => router.push('/sign-in')}
                                className="border border-[#D3A625]/40 text-[#D3A625] hover:bg-[#D3A625] hover:text-[#0a0b0f] px-8 py-3 rounded-xl font-semibold text-base transition-all tracking-wide"
                            >
                                Giriş Yap
                            </button>
                        </div>
                    </section>
                )}

                {/* Footer accent */}
                <div className="h-1 bg-gradient-to-r from-transparent via-[#740001] to-transparent opacity-30" />
            </div>
        </div>
    );
}