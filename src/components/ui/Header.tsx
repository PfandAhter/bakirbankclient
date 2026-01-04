import { Landmark } from 'lucide-react';
import NotificationPanel from "@/src/components/ui/notification/NotificationPanel";

interface HeaderProps {
    user: any;
    pageName: string;
    logout: () => void;
    onLogoClick: () => void;
}

export default function Header({ user, pageName, logout, onLogoClick }: HeaderProps) {

    return (
        <header className="bg-[#0c0d13]/90 backdrop-blur-xl border-b border-[#740001]/20 relative z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button
                            onClick={onLogoClick}
                            className="group flex items-center transition-colors"
                        >
                            <div className="relative">
                                <Landmark className="h-6 w-6 sm:h-8 sm:w-8 text-[#D3A625] group-hover:text-[#EEBA30] transition-colors" />
                                <div className="absolute inset-0 bg-[#D3A625]/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <span className="ml-1.5 sm:ml-2 text-lg sm:text-2xl font-bold text-white group-hover:text-[#D3A625] transition-colors">
                                <span className="text-[#D3A625]">BAKIR</span>BANK
                            </span>
                        </button>
                        <span className="hidden sm:inline text-xl sm:text-2xl font-bold text-white">{pageName}</span>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <span className="text-gray-300 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                            Hoş geldin, <span className="text-[#D3A625] font-medium">{user?.firstName || "Kullanıcı"}</span>
                        </span>
                    </div>
                </div>
            </div>
            <NotificationPanel userId={user?.id || ""} />
        </header>
    );
}