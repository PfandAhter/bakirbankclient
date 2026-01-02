import { User, Lock, Shield, History, Bell, KeyRound, XCircle } from "lucide-react";
import { ProfileTab } from "@/src/types/profile";

interface Props {
    activeTab: ProfileTab;
    setActiveTab: (tab: ProfileTab) => void;
}

export default function ProfileSidebar({ activeTab, setActiveTab }: Props) {
    const menuItems = [
        { id: "profile", label: "Kişisel Bilgiler", icon: User },
        { id: "password", label: "Şifre Değiştir", icon: Lock },
        { id: "security", label: "Güvenlik Ayarları", icon: Shield },
        { id: "sessions", label: "Oturum Geçmişi", icon: History },
        { id: "notifications", label: "Bildirim Ayarları", icon: Bell },
        { id: "accounts", label: "Kayıtlı Hesaplarım", icon: KeyRound },
        { id: "freeze", label: "Hesabı Dondur", icon: XCircle },
    ] as const;

    return (
        <aside className="w-64 bg-[#0f1015]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[#740001]/30 p-6 flex flex-col gap-2 h-fit">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isFreeze = item.id === "freeze";

                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? isFreeze
                                    ? 'bg-gradient-to-r from-[#740001] to-[#5C0001] text-white border border-[#D3A625]/30 shadow-lg'
                                    : 'bg-gradient-to-r from-[#740001] to-[#8B1A1A] text-white border border-[#D3A625]/30 shadow-lg'
                                : 'text-gray-400 hover:bg-[#740001]/20 hover:text-white border border-transparent'
                            }`}
                    >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#D3A625]' : ''}`} />
                        <span className="font-medium">{item.label}</span>
                    </button>
                );
            })}
        </aside>
    );
}