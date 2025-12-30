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
        <header className="bg-black/50 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onLogoClick}
                            className="group flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Landmark className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                            <span className="ml-2 text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">BAKIRBANK</span>
                        </button>
                        <span className="text-2xl font-bold text-white">{pageName}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-gray-300">Hoş geldin, {user?.firstName || "Kullanıcı"}</span>
                    </div>
                </div>
            </div>
            <NotificationPanel userId={user?.id || ""} />
        </header>
    );
}