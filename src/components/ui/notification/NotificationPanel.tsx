'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useNotificationWebSocket } from '@/src/hooks/notification/useNotificationWebSocket';
import { Notification } from '@/src/types/notification';
import { Bell, Trash2, Clock, Inbox } from 'lucide-react';

interface NotificationPanelProps {
    userId: string;
    position?: React.CSSProperties;
    dropDirection?: 'left' | 'right' | 'center';
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
    userId,
    position,
    dropDirection = 'right'
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const tabId = useRef(Math.random().toString(36).substring(2, 9));
    const [unreadCount, setUnreadCount] = useState(0);
    const channelRef = useRef<BroadcastChannel | null>(null);

    const { isConnected } = useNotificationWebSocket({
        userId,
        onNotificationReceived: (notification: Notification) => {
            setNotifications(prev => {
                if (prev.some(n => n.id === notification.id)) {
                    console.log('⚠️ Bildirim zaten mevcut:', notification.id);
                    return prev;
                }
                console.log('✅ Bildirim ekleniyor:', notification.id);
                return [notification, ...prev];
            });

            // Diğer sekmelere bildir
            channelRef.current?.postMessage({
                type: 'NEW_NOTIFICATION',
                payload: notification,
                source: tabId.current
            });
        }
    });

    useEffect(() => {
        channelRef.current = new BroadcastChannel("notifications");
        const channel = channelRef.current;

        channel.onmessage = (event) => {
            if (event.data.source === tabId.current) return;
            if (event.data.type === "INIT_NOTIFICATIONS") {
                setNotifications(event.data.payload);
                setUnreadCount(event.data.payload.filter((n: Notification) => !n.isRead).length);
            }
            if (event.data.type === "NEW_NOTIFICATION") {
                const notification: Notification = event.data.payload;
                setNotifications(prev => {
                    if (prev.some(n => n.id === notification.id)) return prev;
                    return [notification, ...prev];
                });
                setUnreadCount(prev => prev + 1);
            }
            if (event.data.type === "READ_NOTIFICATION") {
                const id = event.data.payload;
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(prev - 1, 0));
            }
            if (event.data.type === "DELETE_NOTIFICATION") {
                const id = event.data.payload;
                const wasUnread = event.data.wasUnread;
                setNotifications(prev => prev.filter(n => n.id !== id));
                if (wasUnread) {
                    setUnreadCount(prev => Math.max(prev - 1, 0));
                }
            }
        };

        return () => channel.close();
    }, []);

    useEffect(() => {
        const count = notifications.filter(n => !n.isRead).length;
        setUnreadCount(count);

        const sorted = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const isSameOrder = sorted.length === notifications.length && sorted.every((v, i) => v.id === notifications[i].id);
        if (!isSameOrder) setNotifications(sorted);
    }, [notifications]);

    useEffect(() => {
        let retryInterval: NodeJS.Timeout | null = null;

        async function fetchNotifications() {
            try {
                const res = await fetch('/api/notification/get', {
                    method: 'POST',
                    credentials: 'include',
                });
                const data = await res.json();

                let notificationsData: Notification[] = [];
                if (Array.isArray(data)) {
                    notificationsData = data;
                } else if (data && Array.isArray(data.notifications)) {
                    notificationsData = data.notifications;
                } else if (data && Array.isArray(data.data)) {
                    notificationsData = data.data;
                } else if (data && Array.isArray(data.payload)) {
                    notificationsData = data.payload;
                } else {
                    console.warn('Unexpected notifications response shape:', data);
                }

                const sorted = [...notificationsData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setNotifications(sorted);

                try {
                    channelRef.current?.postMessage({
                        type: "INIT_NOTIFICATIONS",
                        payload: sorted,
                        source: tabId.current
                    });
                } catch (e) {
                    // Channel may be closed if component unmounted
                }

                if (retryInterval) {
                    clearInterval(retryInterval);
                    retryInterval = null;
                }
            } catch (error) {
                console.error("❌ Bildirimler alınırken hata oluştu:", error);

                if (!retryInterval) {
                    retryInterval = setInterval(() => {
                        console.log("🔁 Bildirimler yeniden alınmaya çalışılıyor...");
                        fetchNotifications();
                    }, 3 * 60 * 1000);
                }

                setNotifications([]);
                setUnreadCount(0);
            }
        }

        if (userId) {
            fetchNotifications();
        }

        return () => {
            if (retryInterval) clearInterval(retryInterval);
        };
    }, [userId]);

    const getDropdownPosition = () => {
        switch (dropDirection) {
            case 'left':
                return 'absolute top-full left-0 mt-2';
            case 'center':
                return 'absolute top-full left-1/2 transform -translate-x-1/2 mt-2';
            case 'right':
            default:
                return 'absolute top-full right-0 mt-2';
        }
    };

    const handleDelete = async (id: string | number) => {
        try {
            const wasUnread = notifications.find(n => n.id === id)?.isRead === false;
            const response = await fetch('/api/notification/delete', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id }),
            });

            if (response.status !== 200) {
                throw new Error('Bildirim silme başarısız.');
            }

            setNotifications(prev => prev.filter(notif => notif.id !== id));
            channelRef.current?.postMessage({ type: "DELETE_NOTIFICATION", payload: id, wasUnread });
        } catch (err) {
            console.error("Silme hatası:", err);
        }
    };

    const handleRead = async (id: string | number) => {
        try {
            await fetch('/api/notification/read', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id }),
            });

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, isRead: true } : notif
                )
            );

            channelRef.current?.postMessage({ type: "READ_NOTIFICATION", payload: id });
        } catch (err) {
            console.error("Okuma hatası:", err);
        }
    };

    const togglePanel = () => setIsOpen(!isOpen);

    const defaultPosition: React.CSSProperties = { top: '10px', right: '1.5rem' };

    const formatTimestamp = (timestamp: string | Date) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Şimdi';
            if (diffMins < 60) return `${diffMins} dk önce`;
            if (diffHours < 24) return `${diffHours} saat önce`;
            if (diffDays < 7) return `${diffDays} gün önce`;
            return date.toLocaleDateString('tr-TR');
        } catch {
            return String(timestamp);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            case 'qr':
                return '📱';
            default:
                return '🔔';
        }
    };

    // Gryffindor themed notification colors
    const getNotificationColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'success':
                return 'from-[#D3A625]/20 to-[#D3A625]/5 border-[#D3A625]/30';
            case 'error':
                return 'from-[#740001]/30 to-[#740001]/10 border-[#740001]/40';
            case 'warning':
                return 'from-amber-500/20 to-amber-600/10 border-amber-500/30';
            case 'info':
                return 'from-[#D3A625]/15 to-[#740001]/10 border-[#D3A625]/20';
            case 'qr':
                return 'from-[#740001]/20 to-[#D3A625]/10 border-[#740001]/30';
            default:
                return 'from-[#740001]/15 to-[#5C0001]/10 border-[#740001]/20';
        }
    };

    const getIconBgColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'success':
                return 'bg-gradient-to-br from-[#D3A625] to-[#B8941F]';
            case 'error':
                return 'bg-gradient-to-br from-[#740001] to-[#5C0001]';
            case 'warning':
                return 'bg-gradient-to-br from-amber-500 to-amber-600';
            case 'info':
                return 'bg-gradient-to-br from-[#8B1A1A] to-[#740001]';
            case 'qr':
                return 'bg-gradient-to-br from-[#740001] to-[#D3A625]';
            default:
                return 'bg-gradient-to-br from-[#740001] to-[#5C0001]';
        }
    };

    return (
        <>
            <style>{`
                    .notification-scrollbar::-webkit-scrollbar { width: 6px; }
                    .notification-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .notification-scrollbar::-webkit-scrollbar-thumb { background: rgba(116, 0, 1, 0.4); border-radius: 3px; }
                    .notification-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(211, 166, 37, 0.6); }
                `}</style>
            <div className="fixed z-50" style={position || defaultPosition}>
                {/* Notification Bell Button - Gryffindor Theme */}
                <button
                    className={`relative group flex items-center justify-center w-12 h-12
                               bg-gradient-to-br from-[#740001] to-[#5C0001]
                               rounded-2xl shadow-lg shadow-black/30
                               hover:shadow-xl hover:shadow-[#740001]/30
                               hover:from-[#8B1A1A] hover:to-[#740001]
                               transition-all duration-300 ease-out
                               border border-[#D3A625]/30 hover:border-[#D3A625]/50`}
                    onClick={togglePanel}
                    aria-label="Bildirimleri Aç/Kapat"
                >
                    <Bell className={`w-6 h-6 text-[#D3A625] transition-transform duration-300 ${isOpen ? 'scale-90' : 'group-hover:scale-110 group-hover:rotate-12'}`} />

                    {unreadCount > 0 && (
                        <>
                            <span
                                className="absolute -top-1 -right-1 min-w-[22px] h-[22px] flex items-center justify-center bg-gradient-to-r from-[#D3A625] to-[#EEBA30] text-[#0a0b0f] text-xs font-bold px-1.5 rounded-full shadow-lg shadow-[#D3A625]/50 animate-pulse">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                            <span
                                className="absolute -top-1 -right-1 w-[22px] h-[22px] bg-[#D3A625] rounded-full animate-ping opacity-75" />
                        </>
                    )}

                    {/* Connection indicator */}
                    <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#740001] ${isConnected ? 'bg-[#D3A625]' : 'bg-red-500'}`} />
                </button>

                {isOpen && (
                    <div
                        className={`${getDropdownPosition()} w-96 bg-gradient-to-b from-[#0f1015]/98 to-[#0a0b0f]/98 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-[#740001]/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300`}>
                        {/* Header - Gryffindor Theme */}
                        <div
                            className="px-5 py-4 border-b border-[#D3A625]/20 bg-gradient-to-r from-[#740001]/20 to-[#D3A625]/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-[#740001] to-[#5C0001] rounded-xl border border-[#D3A625]/30">
                                        <Bell className="w-5 h-5 text-[#D3A625]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Bildirimler</h3>
                                        <p className="text-xs text-gray-400">{notifications.length} bildirim</p>
                                    </div>
                                </div>
                                {unreadCount > 0 && (
                                    <span
                                        className="px-3 py-1 text-xs font-medium bg-[#740001]/30 text-[#D3A625] rounded-full border border-[#D3A625]/30">
                                        {unreadCount} okunmamış
                                    </span>
                                )}
                            </div>
                        </div>

                        <ul className="notification-scrollbar max-h-[420px] overflow-y-auto divide-y divide-[#740001]/20">
                            {notifications.length === 0 ? (
                                <li className="flex flex-col items-center justify-center py-16 px-6">
                                    <div className="p-4 bg-gradient-to-br from-[#740001]/20 to-[#5C0001]/20 rounded-full mb-4 border border-[#D3A625]/20">
                                        <Inbox className="w-10 h-10 text-[#D3A625]/50" />
                                    </div>
                                    <p className="text-gray-400 font-medium">Bildirim yok</p>
                                    <p className="text-gray-500 text-sm mt-1">Yeni bildirimler burada görünecek</p>
                                </li>
                            ) : (
                                notifications.map((notif, index) => (
                                    <li
                                        key={notif.id}
                                        className={`group relative p-4 bg-gradient-to-r ${getNotificationColor(notif.type)} hover:bg-[#740001]/10 transition-all duration-200 cursor-pointer ${!notif.isRead ? 'border-l-2 border-l-[#D3A625]' : 'border-l-2 border-l-transparent'} animate-in fade-in slide-in-from-right-2`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        onClick={() => handleRead(notif.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div
                                                className={`flex-shrink-0 w-10 h-10 ${getIconBgColor(notif.type)} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg border border-[#D3A625]/20`}>
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={`font-semibold truncate ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.isRead && <span
                                                        className="flex-shrink-0 w-2 h-2 bg-[#D3A625] rounded-full mt-2 animate-pulse" />}
                                                </div>
                                                <p className={`text-sm mt-1 line-clamp-2 ${notif.isRead ? 'text-gray-500' : 'text-gray-300'}`}>
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock className="w-3.5 h-3.5 text-[#D3A625]/60" />
                                                    <span className="text-xs text-gray-500">{formatTimestamp(notif.timestamp)}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-500 hover:text-[#D3A625] hover:bg-[#740001]/20 transition-all duration-200"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notif.id);
                                                }}
                                                aria-label="Bildirim Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>

                        {notifications.length > 0 && (
                            <div
                                className="px-5 py-3 border-t border-[#D3A625]/20 bg-gradient-to-r from-[#0f1015]/80 to-[#12131a]/80">
                                <button
                                    className="w-full py-2 text-sm font-medium text-[#D3A625] hover:text-[#EEBA30] transition-colors hover:bg-[#740001]/20 rounded-lg border border-[#740001]/30 hover:border-[#D3A625]/30"
                                    onClick={() => setIsOpen(false)}>
                                    Paneli Kapat
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationPanel;