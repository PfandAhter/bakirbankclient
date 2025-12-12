import { Landmark } from 'lucide-react';
import NotificationPanel from "@/app/components/atmui/NotificationPanel";

interface HeaderProps {
    user: any;
    logout: () => void;
    onLogoClick: () => void;
}

export default function Header({ user, logout, onLogoClick }: HeaderProps) {
    return (
        <header className="bg-[#0c0d13]/80 border-b border-[#1e222d] backdrop-blur-lg sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={onLogoClick}>
                    <Landmark className="h-7 w-7 text-blue-400" />
                    <span className="text-2xl font-bold text-white tracking-tight transform scale-y-125">BAKIRBANK</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-xl font-semibold text-white">İşlemler</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-sm hidden sm:block">
                        Hoş geldin, <span className="text-white font-semibold">{user?.firstName} {user?.lastName}</span>
                    </span>
                    <button onClick={logout} className="bg-red-900/80 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all">
                        Çıkış
                    </button>
                    <NotificationPanel userId={user?.id ?? "null"} />
                </div>
            </div>
        </header>
    );
}