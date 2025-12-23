'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useNotificationWebSocket} from '@/src/hooks/notification/useNotificationWebSocket';
import { Notification } from '@/src/types/notification';

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

    const {isConnected} = useNotificationWebSocket({
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
                    prev.map(n => n.id === id ? {...n, isRead: true} : n)
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

        const sorted = [...notifications].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
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

                const sorted = [...notificationsData].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
                setNotifications(sorted);

                channelRef.current?.postMessage({
                    type: "INIT_NOTIFICATIONS",
                    payload: sorted,
                    source: tabId.current
                });

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

    const handleDelete = async (id: number) => {
        try {
            const wasUnread = notifications.find(n => n.id === id)?.isRead === false;
            const response = await fetch('/api/notification/delete', {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({notificationId: id}),
            });

            if (response.status !== 200) {
                throw new Error('Bildirim silme başarısız.');
            }

            setNotifications(prev => prev.filter(notif => notif.id !== id));
            channelRef.current?.postMessage({type: "DELETE_NOTIFICATION", payload: id, wasUnread});
        } catch (err) {
            console.error("Silme hatası:", err);
        }
    };

    const handleRead = async (id: number) => {
        try {
            await fetch('/api/notification/read', {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({notificationId: id}),
            });

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? {...notif, isRead: true} : notif
                )
            );

            channelRef.current?.postMessage({type: "READ_NOTIFICATION", payload: id});
        } catch (err) {
            console.error("Okuma hatası:", err);
        }
    };

    const togglePanel = () => setIsOpen(!isOpen);

    const defaultPosition: React.CSSProperties = {top: '10px', right: '1.5rem'};

    const formatTimestamp = (timestamp: string) => {
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
            return timestamp;
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

    const getNotificationColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'success':
                return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30';
            case 'error':
                return 'from-red-500/20 to-red-600/10 border-red-500/30';
            case 'warning':
                return 'from-amber-500/20 to-amber-600/10 border-amber-500/30';
            case 'info':
                return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
            case 'qr':
                return 'from-violet-500/20 to-violet-600/10 border-violet-500/30';
            default:
                return 'from-slate-500/20 to-slate-600/10 border-slate-500/30';
        }
    };

    const getIconBgColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'success':
                return 'bg-emerald-500';
            case 'error':
                return 'bg-red-500';
            case 'warning':
                return 'bg-amber-500';
            case 'info':
                return 'bg-blue-500';
            case 'qr':
                return 'bg-violet-500';
            default:
                return 'bg-slate-500';
        }
    };

    return (
        <>
            <style>{`
                    .notification-scrollbar::-webkit-scrollbar { width: 6px; }
                    .notification-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .notification-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.4); border-radius: 3px; }
                    .notification-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.6); }
                `}</style>
            <div className="fixed z-50" style={position || defaultPosition}>
                <button
                    className="relative group flex items-center justify-center w-12 h-12
                               bg-gradient-to-br from-slate-800 to-slate-900
                               rounded-2xl shadow-lg shadow-black/20
                               hover:shadow-xl hover:shadow-blue-500/20
                               hover:from-blue-600 hover:to-blue-700
                               transition-all duration-300 ease-out
                               border border-white/10"
                    onClick={togglePanel}
                    aria-label="Bildirimleri Aç/Kapat"
                >
                    <svg
                        className={`w-6 h-6 text-white transition-transform duration-300 ${isOpen ? 'scale-90' : 'group-hover:scale-110 group-hover:rotate-12'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>

                    {unreadCount > 0 && (
                        <>
                                <span
                                    className="absolute -top-1 -right-1 min-w-[22px] h-[22px] flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-1.5 rounded-full shadow-lg shadow-red-500/50 animate-pulse">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            <span
                                className="absolute -top-1 -right-1 w-[22px] h-[22px] bg-red-500 rounded-full animate-ping opacity-75"/>
                        </>
                    )}

                    {/* Connection indicator */}
                    <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}/>
                </button>

                {isOpen && (
                    <div
                        className={`${getDropdownPosition()} w-96 bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300`}>
                        <div
                            className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-violet-600/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-xl">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Bildirimler</h3>
                                        <p className="text-xs text-slate-400">{notifications.length} bildirim</p>
                                    </div>
                                </div>
                                {unreadCount > 0 && (
                                    <span
                                        className="px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                                            {unreadCount} okunmamış
                                        </span>
                                )}
                            </div>
                        </div>

                        <ul className="notification-scrollbar max-h-[420px] overflow-y-auto divide-y divide-white/5">
                            {notifications.length === 0 ? (
                                <li className="flex flex-col items-center justify-center py-16 px-6">
                                    <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                                        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">Bildirim yok</p>
                                    <p className="text-slate-600 text-sm mt-1">Yeni bildirimler burada görünecek</p>
                                </li>
                            ) : (
                                notifications.map((notif, index) => (
                                    <li
                                        key={notif.id}
                                        className={`group relative p-4 bg-gradient-to-r ${getNotificationColor(notif.type)} hover:bg-white/5 transition-all duration-200 cursor-pointer ${!notif.isRead ? 'border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'} animate-in fade-in slide-in-from-right-2`}
                                        style={{animationDelay: `${index * 50}ms`}}
                                        onClick={() => handleRead(notif.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div
                                                className={`flex-shrink-0 w-10 h-10 ${getIconBgColor(notif.type)} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={`font-semibold truncate ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.isRead && <span
                                                        className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"/>}
                                                </div>
                                                <p className={`text-sm mt-1 line-clamp-2 ${notif.isRead ? 'text-slate-500' : 'text-slate-300'}`}>
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                    <span
                                                        className="text-xs text-slate-500">{formatTimestamp(notif.timestamp)}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notif.id);
                                                }}
                                                aria-label="Bildirim Sil"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>

                        {notifications.length > 0 && (
                            <div
                                className="px-5 py-3 border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                                <button
                                    className="w-full py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
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