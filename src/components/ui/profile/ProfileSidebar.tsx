import { User, Lock, Shield, History, Bell, KeyRound, XCircle } from "lucide-react";
import { ProfileTab } from "@/src/types/profile";

interface Props {
    activeTab: ProfileTab;
    setActiveTab: (tab: ProfileTab) => void;
}

export default function ProfileSidebar({ activeTab, setActiveTab }: Props) {
    const menuItems = [
        { id: "profile", label: "Kişisel Bilgiler", icon: User, color: "bg-blue-600" },
        { id: "password", label: "Şifre Değiştir", icon: Lock, color: "bg-purple-600" },
        { id: "security", label: "Güvenlik Ayarları", icon: Shield, color: "bg-green-600" },
        { id: "sessions", label: "Oturum Geçmişi", icon: History, color: "bg-yellow-600" },
        { id: "notifications", label: "Bildirim Ayarları", icon: Bell, color: "bg-pink-600" },
        { id: "accounts", label: "Kayıtlı Hesaplarım", icon: KeyRound, color: "bg-indigo-600" },
        { id: "freeze", label: "Hesabı Dondur", icon: XCircle, color: "bg-red-600" },
    ] as const;

    return (
        <aside className="w-64 bg-gray-800/70 rounded-2xl shadow-xl border border-gray-700 p-6 flex flex-col gap-4 h-fit">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            isActive ? `${item.color} text-white` : "text-gray-300 hover:bg-gray-700"
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        {item.label}
                    </button>
                );
            })}
        </aside>
    );
}