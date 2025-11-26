'use client';

import { useAuth } from '@/app/lib/hooks/useAuth';
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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationPanel from '@/app/components/atmui/NotificationPanel';
import ChatWidget from '@/app/components/ChatWidget';

export default function HomePage() {
    const { user, isAuthenticated, logout, checkAuth } = useAuth();
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
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-300 text-base font-normal tracking-wide">Ana sayfa yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-[#0a0b0f] text-[#f8fafc] overflow-hidden">
            {/* subtle background */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "url('/bakirbank-transparent.png')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '70%',
                }}
            />

            <div className="relative z-10">
                {isAuthenticated && <ChatWidget />}

                {/* HEADER */}
                <header className="bg-[#0c0d13]/80 border-b border-[#1e222d] backdrop-blur-lg">
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Landmark className="h-7 w-7 text-blue-400" />
                            <h1 className="ml-2 text-2xl font-bold text-white tracking-tight" style={{ transform: 'scaleY(1.3)', transformOrigin: 'center' }}>
                                BAKIRBANK
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-md">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-[15px] tracking-tight leading-tight">
                                                {user?.firstName} {user?.secondName}{' '}
                                                <span className="font-bold">{user?.lastName}</span>
                                            </p>
                                            <p className="text-gray-400 text-[13px] font-normal">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-md font-medium text-sm"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </button>

                                    <button
                                        onClick={() => router.push('/atmfinder')}
                                        className="bg-[#1e293b] hover:bg-[#334155] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 font-medium text-sm"
                                    >
                                        <MapPinned className="w-4 h-4" />
                                        <span>ATM Bul</span>
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="bg-[#7f1d1d] hover:bg-[#991b1b] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all font-medium text-sm"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Çıkış</span>
                                    </button>

                                    <NotificationPanel userId={user?.id || 'null'} />
                                </div>
                            ) : (
                                <div className="space-x-2">
                                    <button
                                        onClick={() => router.push('/sign-in')}
                                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-5 py-2.5 rounded-lg transition-all font-semibold text-sm tracking-wide"
                                    >
                                        Giriş Yap
                                    </button>
                                    <button
                                        onClick={() => router.push('/sign-up')}
                                        className="border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-lg transition-all font-semibold text-sm tracking-wide"
                                    >
                                        Kayıt Ol
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* HERO */}
                <section className="py-24 text-center px-6">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                            {isAuthenticated ? (
                                <>
                                    Hoş geldiniz,{' '}
                                    <span className="text-blue-400">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                </>
                            ) : (
                                <>
                                    Finansın Gücü, <br />
                                    <span className="text-blue-400">Güvenilir Geleceğiniz</span>
                                </>
                            )}
                        </h2>
                        <p className="text-gray-400 text-lg mb-12 font-normal leading-relaxed">
                            {isAuthenticated
                                ? 'Hesaplarınızı yönetin, işlemlerinizi takip edin ve finansal hedeflerinize ulaşın.'
                                : 'Güvenli, hızlı ve modern bankacılık deneyimi için doğru adrestesiniz.'}
                        </p>

                        {isAuthenticated && (
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-3 rounded-lg font-semibold text-base flex items-center space-x-2 transition-all shadow-lg tracking-wide"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    <span>Dashboard'a Git</span>
                                </button>
                                <button
                                    onClick={() => router.push('/transactions')}
                                    className="bg-[#1e293b] hover:bg-[#334155] text-white px-8 py-3 rounded-lg font-semibold text-base flex items-center space-x-2 transition-all tracking-wide"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    <span>İşlemler</span>
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* FEATURE GRID */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                                {isAuthenticated ? 'Hesap Yönetimi' : 'Özellikler'}
                            </h3>
                            <p className="text-gray-400 text-base font-normal">
                                {isAuthenticated
                                    ? 'Bankacılığınızı tam kontrol altına alın'
                                    : 'Modern bankacılığın temel hizmetleri'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {[
                                {
                                    name: 'Dashboard',
                                    icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
                                    desc: 'Hesap özetinizi görüntüleyin',
                                    color: 'from-[#1e293b] to-[#0f172a]',
                                    path: '/dashboard',
                                },
                                {
                                    name: 'Kartlarım',
                                    icon: <Wallet className="w-6 h-6 text-yellow-400" />,
                                    desc: 'Kredi ve banka kartlarınız',
                                    color: 'from-[#1e293b] to-[#0f172a]',
                                    path: '/cards',
                                },
                                {
                                    name: 'Profil',
                                    icon: <User className="w-6 h-6 text-green-400" />,
                                    desc: 'Kişisel bilgilerinizi yönetin',
                                    color: 'from-[#1e293b] to-[#0f172a]',
                                    path: '/profile',
                                },
                                {
                                    name: 'İşlemler',
                                    icon: <CreditCard className="w-6 h-6 text-purple-400" />,
                                    desc: 'Para transferleri ve geçmiş',
                                    color: 'from-[#1e293b] to-[#0f172a]',
                                    path: '/transactions',
                                },
                                {
                                    name: 'Ayarlar',
                                    icon: <Settings className="w-6 h-6 text-orange-400" />,
                                    desc: 'Güvenlik ve hesap tercihleri',
                                    color: 'from-[#1e293b] to-[#0f172a]',
                                    path: '/settings',
                                },
                            ].map((item) => (
                                <div
                                    key={item.name}
                                    onClick={() => handleProtectedAction(item.path)}
                                    className={`relative p-6 rounded-2xl border border-[#1e222d] bg-gradient-to-br ${item.color} cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/50`}
                                >
                                    <div className="absolute inset-0 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/10 before:to-transparent rounded-2xl" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm font-normal leading-relaxed">{item.desc}</p>
                                        {isAuthenticated && (
                                            <p className="mt-3 text-green-400 text-sm font-semibold tracking-wide">
                                                ✓ Erişim sağlandı
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
                        <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">
                            Hemen Başlayın
                        </h3>
                        <p className="text-gray-400 mb-8 text-base font-normal">
                            Ücretsiz hesap oluşturun ve modern bankacılığı deneyimleyin.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => router.push('/sign-up')}
                                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-3 rounded-lg font-semibold text-base transition-all tracking-wide"
                            >
                                Ücretsiz Kayıt Ol
                            </button>
                            <button
                                onClick={() => router.push('/sign-in')}
                                className="border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold text-base transition-all tracking-wide"
                            >
                                Giriş Yap
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}