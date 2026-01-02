'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/login/useAuth";
import ProtectedRoute from '@/src/providers/ProtectedRoute';
import { RefreshCw, Save, Landmark, Sparkles } from "lucide-react";

// Components
import NotificationPanel from "@/src/components/ui/notification/NotificationPanel";
import ProfileSidebar from "@/src/components/ui/profile/ProfileSidebar";
import PersonalInfoSection from "@/src/components/ui/profile/sections/PersonelInfoSection";
import { PasswordSection, SessionHistorySection } from "@/src/components/ui/profile/sections/OtherSections";
import { Shield, Bell, KeyRound, XCircle, User } from "lucide-react";

// Hooks & Types
import { useProfileData } from "@/src/hooks/useProfileData";
import { useSessionHistory } from "@/src/hooks/useSessionHistory";
import { ProfileTab } from "@/src/types/profile";
import Header from "@/src/components/ui/Header";

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
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-[#D3A625] animate-spin mx-auto mb-4" />
                    <p className="text-white">Profil bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0a0b0f] relative">
                {/* Gryffindor ambient background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#740001]/8 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#D3A625]/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
                </div>

                {/* Header */}
                <Header user={user} pageName={"| Profilim"} logout={logout} onLogoClick={() => router.push('/')} />

                {/* Main Content */}
                <div className="relative z-10 max-w-5xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8">

                    <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    <main className="flex-1 bg-[#0f1015]/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-[#740001]/30 p-4 sm:p-6 lg:p-8">
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
                                    <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-[#D3A625]" /> Güvenlik Ayarları</h1>
                                    <p className="text-gray-300 mb-2">İki adımlı doğrulama: Kapalı</p>
                                    <button type="button" className="bg-gradient-to-r from-[#740001] to-[#8B1A1A] px-4 py-2 rounded-lg text-white text-sm border border-[#D3A625]/20">Etkinleştir</button>
                                </div>
                            )}

                            {activeTab === "notifications" && (
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-[#D3A625]" /> Bildirim Ayarları</h1>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 text-gray-300 p-3 bg-[#12131a] rounded-lg border border-[#740001]/20">
                                            <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#D3A625]" /> E-posta Bildirimleri
                                        </label>
                                        <label className="flex items-center gap-3 text-gray-300 p-3 bg-[#12131a] rounded-lg border border-[#740001]/20">
                                            <input type="checkbox" className="w-4 h-4 accent-[#D3A625]" /> SMS Bildirimleri
                                        </label>
                                    </div>
                                </div>
                            )}

                            {activeTab === "accounts" && (
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><KeyRound className="w-5 h-5 text-[#D3A625]" /> Kayıtlı Hesaplarım</h1>
                                    <div className="space-y-2 text-gray-300">
                                        <p className="p-3 bg-[#12131a] rounded-lg border border-[#740001]/20">Google hesabı bağlı</p>
                                        <p className="p-3 bg-[#12131a] rounded-lg border border-[#740001]/20">Apple hesabı bağlı</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === "freeze" && (
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><XCircle className="w-5 h-5 text-[#740001]" /> Hesabı Dondur</h1>
                                    <p className="text-[#D3A625] mb-4">Hesabınızı geçici olarak dondurabilirsiniz.</p>
                                    <button type="button" className="bg-gradient-to-r from-[#740001] to-[#5C0001] px-4 py-2 rounded-lg text-white hover:from-[#8B1A1A] hover:to-[#740001] transition-colors border border-[#D3A625]/20">Hesabı Dondur</button>
                                </div>
                            )}

                            {/* Save Button for Forms */}
                            {(activeTab === "profile" || activeTab === "password") && (
                                <div className="flex justify-end pt-4 border-t border-[#740001]/30 mt-6">
                                    <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white rounded-xl shadow-lg transition-all font-medium border border-[#D3A625]/20">
                                        <Sparkles className="w-5 h-5 text-[#D3A625]" /> Değişiklikleri Kaydet
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