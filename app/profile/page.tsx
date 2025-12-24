'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/login/useAuth";
import ProtectedRoute from '@/src/providers/ProtectedRoute';
import { RefreshCw, Save, Landmark } from "lucide-react";

// Components
import NotificationPanel from "@/src/components/ui/notification/NotificationPanel";
import ProfileSidebar from "@/src/components/ui/profile/ProfileSidebar";
import PersonalInfoSection from "@/src/components/ui/profile/sections/PersonelInfoSection";
import { PasswordSection, SessionHistorySection } from "@/src/components/ui/profile/sections/OtherSections";
import { Shield, Bell, KeyRound, XCircle } from "lucide-react";

// Hooks & Types
import { useProfileData } from "@/src/hooks/useProfileData";
import { useSessionHistory } from "@/src/hooks/useSessionHistory";
import { ProfileTab } from "@/src/types/profile";

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

    // Logic Hooks
    const { formData, handleChange, isLoading, tcknError, validateTckn } = useProfileData();
    const { history } = useSessionHistory(activeTab, user?.id);

    // Loading & Redirect Logic
    useEffect(() => {
        if (isLoading) {
            const timeout = setTimeout(() => router.push("/"), 5000);
            return () => clearTimeout(timeout);
        }
    }, [isLoading, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form verisi:", formData);
        // API call to update info here
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4"/>
                    <p className="text-white">Profil bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                {/* Header - Inline or Separated Component */}
                <header className="bg-black/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <button onClick={() => router.push('/')} className="group flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                                    <Landmark className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors"/>
                                    <span className="ml-2 text-2xl font-bold text-white group-hover:text-blue-300">BAKIRBANK</span>
                                </button>
                                <span className="text-2xl font-bold text-white">Profil</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-300 hidden sm:block">Hoş geldin, {user?.firstName} {user?.lastName}</span>
                                <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">Çıkış Yap</button>
                            </div>
                        </div>
                    </div>
                    <NotificationPanel userId={user?.id ?? "null"} />
                </header>

                {/* Main Content */}
                <div className="max-w-5xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-8">

                    <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    <main className="flex-1 bg-gray-800/70 rounded-2xl shadow-2xl border border-gray-700 p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Tab Contents */}
                            {activeTab === "profile" && (
                                <PersonalInfoSection
                                    formData={formData}
                                    handleChange={handleChange}
                                    tcknError={tcknError}
                                    onTcknBlur={validateTckn}
                                />
                            )}

                            {activeTab === "password" && (
                                <PasswordSection formData={formData} handleChange={handleChange} />
                            )}

                            {activeTab === "sessions" && (
                                <SessionHistorySection history={history} />
                            )}

                            {/* Basit placeholder içerikler */}
                            {activeTab === "security" && (
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-green-400"/> Güvenlik Ayarları</h1>
                                    <p className="text-gray-300 mb-2">İki adımlı doğrulama: Kapalı</p>
                                    <button type="button" className="bg-green-600 px-4 py-2 rounded-lg text-white text-sm">Etkinleştir</button>
                                </div>
                            )}

                            {activeTab === "notifications" && (
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-pink-400"/> Bildirim Ayarları</h1>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-gray-300"><input type="checkbox" defaultChecked/> E-posta Bildirimleri</label>
                                        <label className="flex items-center gap-2 text-gray-300"><input type="checkbox"/> SMS Bildirimleri</label>
                                    </div>
                                </div>
                            )}

                            {activeTab === "accounts" && (
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><KeyRound className="w-5 h-5 text-indigo-400"/> Kayıtlı Hesaplarım</h1>
                                    <div className="space-y-2 text-gray-300">
                                        <p>Google hesabı bağlı</p>
                                        <p>Apple hesabı bağlı</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === "freeze" && (
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-400"/> Hesabı Dondur</h1>
                                    <p className="text-red-400 mb-4">Hesabınızı geçici olarak dondurabilirsiniz.</p>
                                    <button type="button" className="bg-red-600 px-4 py-2 rounded-lg text-white hover:bg-red-700 transition-colors">Hesabı Dondur</button>
                                </div>
                            )}

                            {/* Save Button for Forms */}
                            {(activeTab === "profile" || activeTab === "password") && (
                                <div className="flex justify-end pt-4 border-t border-gray-700 mt-6">
                                    <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-colors font-medium">
                                        <Save className="w-5 h-5"/> Değişiklikleri Kaydet
                                    </button>
                                </div>
                            )}
                        </form>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}