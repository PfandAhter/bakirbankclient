'use client';

import { useRouter } from "next/navigation";
import { Landmark, User, LogOut, MapPin } from "lucide-react";
import NotificationPanel from "@/src/components/ui/notification/NotificationPanel";

interface HeaderProps {
    isAuthenticated: boolean;
    user: any;
    onLogoClick: () => void;
    onLogout: () => void;
}

export const Header = ({ isAuthenticated, onLogoClick, user, onLogout }: HeaderProps) => {
    const router = useRouter();

    return (
        <header className="bg-[#0a0b0f]/95 backdrop-blur-md border-b border-[#740001]/30 relative z-[50]">
            <div className="w-full">
                <div className="flex justify-between items-center h-14 sm:h-16 px-3 sm:px-4">
                    <div className="flex items-center pl-0 sm:pl-4 lg:pl-70">
                        <button
                            onClick={onLogoClick}
                            className="group flex items-center transition-colors"
                        >
                            <Landmark className="h-6 w-6 sm:h-8 sm:w-8 text-[#D3A625] group-hover:text-[#EEBA30] transition-colors" />
                            <span className="ml-1.5 sm:ml-2 text-lg sm:text-2xl font-bold text-[#D3A625] group-hover:text-[#EEBA30] transition-colors">BAKIRBANK</span>
                            <span className="ml-2 text-lg sm:text-2xl font-bold text-white flex items-center gap-1">
                                <span className="text-gray-400">|</span>
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#740001]" />
                                ATM Bul
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isAuthenticated && (
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
                                <NotificationPanel
                                    userId={user?.id || ""}
                                    position={{ position: 'relative' }}
                                    dropDirection="center"
                                />
                            </div>
                        )}
                        {isAuthenticated ? (
                            <div className="flex items-center justify-end w-full space-x-2 sm:space-x-4">
                                <div className="flex items-center gap-2 sm:gap-4 lg:gap-60 pr-1 sm:pr-5">
                                    {/* User info - hidden on mobile */}
                                    <div className="hidden md:flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-[#740001] to-[#8B1A1A] rounded-full flex items-center justify-center border border-[#D3A625]/30">
                                            <User className="w-5 h-5 text-[#D3A625]" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-medium">{user?.firstName || "ATABERK TEST"}</p>
                                            <p className="text-[#D3A625]/70 text-sm">{user?.email || "USER.EMAIL TEST"}</p>
                                        </div>
                                    </div>
                                    <button onClick={onLogout} className="bg-gradient-to-r from-[#740001] to-[#5C0001] hover:from-[#8B1A1A] hover:to-[#740001] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center space-x-1 sm:space-x-2 ml-auto text-sm sm:text-base border border-[#D3A625]/20">
                                        <LogOut className="w-4 h-4 text-[#D3A625]" />
                                        <span className="hidden sm:inline">Çıkış</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <button onClick={() => router.push('/sign-in')} className="bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-sm sm:text-base border border-[#D3A625]/20">Giriş Yap</button>
                                <button onClick={() => router.push('/sign-up')} className="hidden sm:block bg-[#D3A625] hover:bg-[#EEBA30] text-[#0a0b0f] px-4 py-2 rounded-lg transition-colors font-bold">Kayıt Ol</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};