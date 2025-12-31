'use client';

import { useRouter } from "next/navigation";
import { Landmark, User, LogOut } from "lucide-react";
import NotificationPanel from "@/src/components/ui/notification/NotificationPanel";

interface HeaderProps {
    isAuthenticated: boolean;
    user: any; // User type'ını kendi auth sisteminden alabilirsin
    onLogoClick: () => void;
    onLogout: () => void;
}

export const Header = ({ isAuthenticated, onLogoClick, user, onLogout }: HeaderProps) => {
    const router = useRouter();

    return (
        <header className="bg-black border-b border-gray-800">
            <div className="w-full">
                <div className="flex justify-between items-center h-14 sm:h-16 px-3 sm:px-4">
                    <div className="flex items-center pl-0 sm:pl-4 lg:pl-70">
                        <button
                            onClick={onLogoClick}
                            className="group flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Landmark className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                            <span className="ml-1.5 sm:ml-2 text-lg sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">BAKIRBANK | ATM Bul</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center justify-end w-full space-x-2 sm:space-x-4">
                                <NotificationPanel userId={"6bb91e57-032c-40db-b6ce-4e3ef459c3a0"} position={{ top: '3%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' }} dropDirection={"center"} />
                                <div className="flex items-center gap-2 sm:gap-4 lg:gap-60 pr-1 sm:pr-5">
                                    {/* User info - hidden on mobile */}
                                    <div className="hidden md:flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-medium">{user?.firstName || "ATABERK TEST"}</p>
                                            <p className="text-gray-400 text-sm">{user?.email || "USER.EMAIL TEST"}</p>
                                        </div>
                                    </div>
                                    <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 ml-auto text-sm sm:text-base">
                                        <LogOut className="w-4 h-4" />
                                        <span className="hidden sm:inline">Çıkış</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <button onClick={() => router.push('/sign-in')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base">Giriş Yap</button>
                                <button onClick={() => router.push('/sign-up')} className="hidden sm:block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">Kayıt Ol</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};