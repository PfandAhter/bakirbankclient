'use client';

import ProtectedRoute from '@/app/lib/providers/ProtectedRoute';
import {
    Save,
    Lock,
    User,
    Mail,
    Phone,
    Home,
    Landmark,
    Shield,
    History,
    Bell,
    KeyRound,
    Settings,
    XCircle, CheckCircle
} from "lucide-react";
import NotificationPanel from "@/app/components/atmui/NotificationPanel";
import {useRouter} from "next/navigation";
import {useAuth} from "@/app/lib/hooks/useAuth";
import { useEffect, useState} from 'react';
import axios from 'axios';

export default function ProfilePage() {
    const router = useRouter();
    const {user, logout} = useAuth();

    type TabType = "profile" | "password" | "security" | "sessions" | "notifications" | "accounts" | "freeze";

    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [sessionHistory, setSessionHistory] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        firstName: "",
        secondName: "",
        lastName: "",
        tckn: "",
        phone: "",
        email: "",
        address: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    useEffect(() => {
        if (activeTab === "sessions") {
            axios.get("http://localhost:8090/api/v1/profile/session-history", {
                params: { userId: user?.id }
            })
                .then(res => setSessionHistory(res.data))
                .catch(err => console.error("Oturum geçmişi alınamadı:", err));
        }
    }, [activeTab]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form data gönderildi:", formData);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                {/* Header */}
                <header className="bg-black/50 backdrop-blur-md border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.push('/')}
                                    className="group flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <Landmark
                                        className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors"/>
                                    <span className="ml-2 text-2xl font-bold text-white group-hover:text-blue-300">
                                        BAKIRBANK
                                    </span>
                                </button>
                                <span className="text-2xl font-bold text-white">Profil</span>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-gray-300">Hoş geldin, {user?.username ?? "TEST USER"}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </div>
                    <NotificationPanel userId={"6bb91e57-032c-40db-b6ce-4e3ef459c3a0"}/>
                </header>

                {/* Content */}
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-10 px-4">
                    <div className="max-w-5xl mx-auto flex gap-8">
                        {/* Sol Menü */}
                        <aside
                            className="w-64 bg-gray-800/70 rounded-2xl shadow-xl border border-gray-700 p-6 flex flex-col gap-4">
                            <button onClick={() => setActiveTab("profile")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "profile" ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
                                <User className="w-5 h-5"/> Kişisel Bilgiler
                            </button>
                            <button onClick={() => setActiveTab("password")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "password" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
                                <Lock className="w-5 h-5"/> Şifre Değiştir
                            </button>
                            <button onClick={() => setActiveTab("security")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "security" ? "bg-green-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
                                <Shield className="w-5 h-5"/> Güvenlik Ayarları
                            </button>
                            <button onClick={() => setActiveTab("sessions")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "sessions" ? "bg-yellow-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
                                <History className="w-5 h-5"/> Oturum Geçmişi
                            </button>
                            <button onClick={() => setActiveTab("notifications")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "notifications" ? "bg-pink-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
                                <Bell className="w-5 h-5"/> Bildirim Ayarları
                            </button>
                            <button onClick={() => setActiveTab("accounts")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "accounts" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
                                <KeyRound className="w-5 h-5"/> Kayıtlı Hesaplarım
                            </button>
                            <button onClick={() => setActiveTab("freeze")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "freeze" ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
                                <XCircle className="w-5 h-5"/> Hesabı Dondur
                            </button>
                        </aside>

                        {/* Orta İçerik */}
                        <main className="flex-1 bg-gray-800/70 rounded-2xl shadow-2xl border border-gray-700 p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">

                                {activeTab === "profile" && (<> <h1
                                    className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-400"/> Kişisel Bilgiler </h1>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-300 mb-1">Ad</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                onKeyDown={(e) => {
                                                    if (/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                placeholder={"Ad"}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-1">İkinci Ad</label>
                                            <input
                                                type="text"
                                                name="secondName"
                                                value={formData.secondName}
                                                onChange={handleChange}
                                                onKeyDown={(e) => {
                                                    if (/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                placeholder={"İkinci Ad (Varsa)"}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-1">Soyad</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                onKeyDown={(e) => {
                                                    if (/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                placeholder={"Soyad"}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-1">TCKN</label>
                                            <input
                                                type="text"
                                                name="tckn"
                                                value={formData.tckn}
                                                onChange={handleChange}
                                                placeholder={"12345678901"}
                                                onKeyDown={(e) => {
                                                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                maxLength={11}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-1">Telefon</label>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400"/>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    onKeyDown={(e) => {
                                                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    maxLength={10}
                                                    placeholder="5xxxxxxxxx"
                                                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-1">E-posta</label>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400"/>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder={"test@bakirbank.com"}
                                                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-300 mb-1">Adres</label>
                                            <div className="flex items-center gap-2">
                                                <Home className="w-4 h-4 text-gray-400"/>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Adresinizi girin"
                                                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>)}

                                {activeTab === "password" && (<> <h1
                                    className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-purple-400"/> Şifre Değiştir </h1>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-300 mb-1">Eski Şifre</label>
                                            <input
                                                type="password"
                                                name="oldPassword"
                                                value={formData.oldPassword}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 mb-1">Yeni Şifre</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-300 mb-1">Yeni Şifre (Tekrar)</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                                            />
                                        </div>
                                    </div>
                                </>)}

                                {activeTab === "security" && (
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-green-400"/> Güvenlik Ayarları
                                        </h1>
                                        <p className="text-gray-300">İki adımlı doğrulama: Kapalı</p>
                                        <button
                                            className="bg-green-600 px-4 py-2 rounded-lg text-white mt-2">Etkinleştir
                                        </button>
                                    </div>
                                )}

                                {activeTab === "sessions" && (
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                            <History className="w-5 h-5 text-yellow-400"/> Oturum Geçmişi
                                        </h1>

                                        <ul className="space-y-3">
                                            {sessionHistory.map((session, index) => (
                                                <li key={index}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700">

                                                    <div>
                                                        <p className="text-white font-semibold">
                                                            {session.device} - {session.location}
                                                        </p>
                                                        <p className="text-sm text-gray-400">
                                                            {session.ipAddress} • {new Date(session.loginTime).toLocaleString()}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        {session.success ? (
                                                            <span className="flex items-center gap-1 text-green-400">
                                <CheckCircle className="w-5 h-5"/> Başarılı
                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-red-400">
                                <XCircle className="w-5 h-5"/> Hatalı
                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {activeTab === "notifications" && (
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Bell className="w-5 h-5 text-pink-400"/> Bildirim Ayarları
                                        </h1>
                                        <label className="flex items-center gap-2 text-gray-300 mb-2">
                                            <input type="checkbox" defaultChecked/> E-posta Bildirimleri
                                        </label>
                                        <label className="flex items-center gap-2 text-gray-300">
                                            <input type="checkbox"/> SMS Bildirimleri
                                        </label>
                                    </div>
                                )}

                                {activeTab === "accounts" && (
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                            <KeyRound className="w-5 h-5 text-indigo-400"/> Kayıtlı Hesaplarım
                                        </h1>
                                        <p className="text-gray-300">Google hesabı bağlı</p>
                                        <p className="text-gray-300">Apple hesabı bağlı</p>
                                        <button className="bg-indigo-600 px-4 py-2 rounded-lg text-white mt-2">Yeni
                                            Hesap Ekle
                                        </button>
                                    </div>
                                )}

                                {activeTab === "freeze" && (
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                            <XCircle className="w-5 h-5 text-red-400"/> Hesabı Dondur
                                        </h1>
                                        <p className="text-red-400 mb-4">Hesabınızı geçici olarak dondurabilirsiniz.</p>
                                        <button className="bg-red-600 px-4 py-2 rounded-lg text-white">Hesabı Dondur
                                        </button>
                                    </div>
                                )}

                                {/* Kaydet Butonu sadece profile ve password için gösterelim */}
                                {(activeTab === "profile" || activeTab === "password") && (
                                    <div className="flex justify-end">
                                        <button type="submit"
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-colors">
                                            <Save className="w-5 h-5"/> Kaydet
                                        </button>
                                    </div>
                                )}
                            </form>
                        </main>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
