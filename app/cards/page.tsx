'use client';

import {useEffect, useState} from 'react';
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
    Filter
} from 'lucide-react';
import NotificationPanel from '@/src/components/ui/notification/NotificationPanel';

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
            <div className="min-h-screen bg-[#0a0b0f] text-[#f8fafc]">
                <header className="bg-[#0c0d13]/80 border-b border-[#1e222d] backdrop-blur-lg sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Landmark className="h-7 w-7 text-blue-500" />
                            <span className="text-xl font-bold tracking-tight">BAKIRBANK</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-300 font-medium">Kartlarım</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 bg-[#1e222d] px-3 py-1.5 rounded-full border border-gray-800">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                                {user?.firstName} {user?.lastName}
                            </div>
                            <button onClick={() => router.push('/')} className="hover:text-white text-gray-400">
                                <LogOut className="w-5 h-5" />
                            </button>
                            <NotificationPanel userId={user?.id ?? 'null'} />
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Kart Portföyü</h1>
                            <p className="text-gray-400 text-sm">Aktif kartlarınızı yönetin veya yeni başvuru yapın.</p>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {/* Account Filter */}
                            <div className="relative flex-1 md:w-64">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4"/>
                                <select
                                    value={selectedAccountFilter}
                                    onChange={(e) => setSelectedAccountFilter(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-[#1e222d] border border-gray-700 rounded-lg text-sm text-white focus:border-blue-500 outline-none appearance-none"
                                >
                                    <option value="all">Tüm Hesaplar</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden md:inline">Yeni Kart Oluştur</span>
                                <span className="md:hidden">Yeni</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-400">Kart bilgileri yükleniyor...</p>
                        </div>
                    ) : cards.length === 0 ? (
                        <div className="bg-[#1e222d]/50 border border-dashed border-gray-700 rounded-2xl p-12 text-center">
                            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Bu hesapta kart bulunmuyor</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                Seçili hesap için henüz bir kart tanımlanmamış. Hemen yeni bir kart başvurusu yaparak harcamaya başlayabilirsiniz.
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-blue-400 hover:text-blue-300 font-medium"
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