'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/hooks/login/useAuth';
import { useRouter } from 'next/navigation';
import { useCards } from '@/src/hooks/useCards';
import { useAccounts } from '@/src/hooks/useAccounts';
import ProtectedRoute from '@/src/providers/ProtectedRoute';
import CardItem from '@/src/components/ui/cards/CardItem';
import CreateCardModal from '@/src/components/ui/cards/CreateCardModal';
import {
    Plus,
    RefreshCw,
    Landmark,
    LogOut,
    CreditCard,
    Filter,
    Sparkles
} from 'lucide-react';
import NotificationPanel from '@/src/components/ui/notification/NotificationPanel';
import Header from "@/src/components/ui/Header";

export default function CardsPage() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { accounts } = useAccounts(isAuthenticated);

    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountFilter) {
            setSelectedAccountFilter(accounts[0].id);
        }
    }, [accounts]);

    const { cards, loading, createCard, toggleCardBlock } = useCards(selectedAccountFilter || null);

    const handleCreateCard = async (data: any) => {
        return await createCard({
            ...data,
            cardHolderName: `${user?.firstName} ${user?.lastName}`
        });
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0a0b0f] text-[#f8fafc] relative">
                {/* Gryffindor ambient background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#740001]/8 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D3A625]/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
                </div>

                <Header user={user} pageName={"| Kartlarım"} logout={logout} onLogoClick={() => router.push('/')} />

                <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-[#D3A625]" />
                                Kart Portföyü
                            </h1>
                            <p className="text-gray-400 text-xs sm:text-sm">Aktif kartlarınızı yönetin veya yeni başvuru yapın.</p>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {/* Account Filter */}
                            <div className="relative flex-1 md:w-64">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D3A625]/60 w-4 h-4" />
                                <select
                                    value={selectedAccountFilter}
                                    onChange={(e) => setSelectedAccountFilter(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-[#0f1015] border border-[#740001]/30 rounded-lg text-sm text-white focus:border-[#D3A625] outline-none appearance-none"
                                >
                                    <option value="all">Tüm Hesaplar</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#9f2020] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-[#740001]/20 border border-[#D3A625]/20"
                            >
                                <Sparkles className="w-4 h-4 text-[#D3A625]" />
                                <span className="hidden md:inline">Yeni Kart Oluştur</span>
                                <span className="md:hidden">Yeni</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <RefreshCw className="w-8 h-8 text-[#D3A625] animate-spin mb-4" />
                            <p className="text-gray-400">Kart bilgileri yükleniyor...</p>
                        </div>
                    ) : cards.length === 0 ? (
                        <div className="bg-[#0f1015]/80 border border-dashed border-[#740001]/40 rounded-2xl p-12 text-center">
                            <CreditCard className="w-16 h-16 text-[#740001]/50 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Bu hesapta kart bulunmuyor</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                Seçili hesap için henüz bir kart tanımlanmamış. Hemen yeni bir kart başvurusu yaparak harcamaya başlayabilirsiniz.
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-[#D3A625] hover:text-[#EEBA30] font-medium"
                            >
                                + Yeni Kart Ekle
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cards.map((card) => (
                                <CardItem
                                    key={card.id}
                                    card={card}
                                    onToggleBlock={toggleCardBlock}
                                />
                            ))}
                        </div>
                    )}
                </main>

                <CreateCardModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateCard}
                    accounts={accounts}
                />
            </div>
        </ProtectedRoute>
    );
}