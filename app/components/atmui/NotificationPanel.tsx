'use client';

import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface Notification {
    id: number;
    message: string;
    title: string;
    type: string;
    timestamp: string;
    isRead?: boolean;
}

interface NotificationPanelProps {
    userId: string ;
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
    const clientRef = useRef<Client | null>(null);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const isProcessingRef = useRef(false); // 🔥 Tekrar işlemeyi önlemek için

    useEffect(() => {
        channelRef.current = new BroadcastChannel("notifications");
        const channel = channelRef.current;

        channel.onmessage = (event) => {
            if (event.data.source === tabId.current) return; // 🔥 kendi mesajını yoksay
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

        return () => channel.close(); // ✅ cleanup
    }, []);

    useEffect(() => {
        // Update unread count
        const count = notifications.filter(n => !n.isRead).length;
        setUnreadCount(count);

        // Ensure notifications are sorted by timestamp (newest first)
        const sorted = [...notifications].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
        const isSameOrder = sorted.length === notifications.length && sorted.every((v, i) => v.id === notifications[i].id);
        if (!isSameOrder) setNotifications(sorted);
    }, [notifications]);

    useEffect(() => {
        let retryInterval: NodeJS.Timeout | null = null;

        async function fetchNotifications() {
            try {
                const res = await fetch('/api/notification/get',{
                    method: 'POST',
                    credentials: 'include',
                });
                const data = await res.json();


                // Normalize response to an array of notifications
                let notificationsData: Notification[] = [];
                if (Array.isArray(data)) {
                    notificationsData = data;
                } else if (data && Array.isArray((data as any).notifications)) {
                    notificationsData = (data as any).notifications;
                } else if (data && Array.isArray((data as any).data)) {
                    notificationsData = (data as any).data;
                } else if (data && Array.isArray((data as any).payload)) {
                    notificationsData = (data as any).payload;
                } else {
                    console.warn('Unexpected notifications response shape:', data);
                }

                // Ensure notifications are sorted by timestamp (newest first)
                const sorted = [...notificationsData].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
                setNotifications(sorted);

                // Diğer sekmeler için senkronizasyon
                channelRef.current?.postMessage({
                    type: "INIT_NOTIFICATIONS",
                    payload: sorted,
                    source: tabId.current
                });

                // Eğer daha önce hata nedeniyle interval başlatılmışsa durdur
                if (retryInterval) {
                    clearInterval(retryInterval);
                    retryInterval = null;
                    console.log("✅ Notification server tekrar erişilebilir hale geldi, retry interval temizlendi.");
                }

            } catch (error) {
                console.error("❌ Bildirimler alınırken hata oluştu:", error);

                // Retry interval zaten çalışmıyorsa başlat
                if (!retryInterval) {
                    retryInterval = setInterval(() => {
                        console.log("🔁 Bildirimler yeniden alınmaya çalışılıyor...");
                        fetchNotifications();
                    }, 3 * 60 * 1000); // 3 dakika
                }

                setNotifications([]);
                setUnreadCount(0);
            }
        }

        if (userId) {
            // İlk çağrı (component mount olduğunda)
            fetchNotifications();
        }

        // Cleanup: component unmount olursa interval temizle
        return () => {
            if (retryInterval) clearInterval(retryInterval);
        };
    }, [userId]);

    useEffect(() => {
        async function setupWebSocket() {
            try {
                // userId’yi cookie'den alan route’tan iste
                const res = await fetch('/api/notification/socket/notification', {
                    method: 'POST',
                    credentials: 'include', // ✅ Cookie'yi gönder
                });

                if (!res.ok) throw new Error('User not authorized');
                const data = await res.json();
                const socket = new SockJS('http://localhost:8080/notification/notification-websocket');

                const client = new Client({
                    webSocketFactory: () => socket,
                    reconnectDelay: 1000,
                    onConnect: () => {
                        console.log('✅ Connected to Notification WebSocket');

                        client.subscribe(`/user/${data.userId}/notifications`, (message) => {
                            if (isProcessingRef.current) {
                                console.log('⚠️ Zaten bir bildirim işleniyor, atlanıyor');
                                return;
                            }

                            isProcessingRef.current = true;

                            try {
                                const payload = JSON.parse(message.body);
                                const notification: Notification = {
                                    id: payload.id,
                                    message: payload.message,
                                    title: payload.title,
                                    type: payload.type,
                                    timestamp: payload.timestamp,
                                    isRead: false,
                                };

                                console.log('📩 Yeni bildirim alındı:', notification.id);

                                // 🔹 State güncelleme - duplicate kontrolü ile
                                setNotifications(prev => {
                                    if (prev.some(n => n.id === notification.id)) {
                                        console.log('⚠️ Bildirim zaten mevcut:', notification.id);
                                        return prev;
                                    }
                                    console.log('✅ Bildirim ekleniyor:', notification.id);
                                    return [notification, ...prev];
                                });

                                // 🔹 Diğer sekmelere bildir
                                channelRef.current?.postMessage({
                                    type: 'NEW_NOTIFICATION',
                                    payload: notification,
                                    source: tabId.current
                                });
                            } finally {
                                // 🔥 Kilitten çık - küçük bir gecikme ile
                                setTimeout(() => {
                                    isProcessingRef.current = false;
                                }, 100);
                            }
                        });
                    },
                    onStompError: (frame) => {
                        console.error('STOMP error:', frame);
                    },
                });

                client.activate();
                clientRef.current = client;
            } catch (error) {
                console.error('❌ WebSocket setup failed:', error);
            }
        }

        setupWebSocket();

        return () => {
            if (clientRef.current) {
                console.log('🔌 WebSocket bağlantısı kapatılıyor');
                clientRef.current.deactivate();
            }
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
    }

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch('/api/notification/delete', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId: id }),
            })
            const data = response;

            if(data.status && data.status !== 200){
                throw new Error('Bildirim silme başarısız.');
            }

            setNotifications(prev => prev.filter(notif => notif.id !== id));
            channelRef.current?.postMessage({ type: "DELETE_NOTIFICATION", payload: id });
        } catch (err) {
            console.error("Silme hatası:", err);
        }
    };

    const handleRead = async (id: number) => {
        try {
            await fetch('/api/notification/read', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    const defaultPosition: React.CSSProperties = { top: '10px', right: '1.5rem' };

    return (
        <div
            className="fixed z-50"
            style={position ? position : defaultPosition}
        >
            <button
                className="relative flex items-center justify-center w-12 h-12 bg-black rounded-full shadow-lg hover:bg-blue-500 transition-colors"
                onClick={togglePanel}
                aria-label="Bildirimleri Aç/Kapat"
            >
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && (
                    <span
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`${getDropdownPosition()} w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-fade-in`}>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <span>Bildirimler</span>
                        <span className="ml-auto text-xs text-gray-400">{notifications.length} toplam</span>
                    </h3>
                    <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <li className="text-gray-400 text-center py-6">Hiç bildirim yok</li>
                        ) : (
                            notifications.map((notif) => (
                                <li key={notif.id}
                                    className={`rounded-lg p-3 shadow flex flex-col gap-1 relative group cursor-pointer ${notif.isRead ? "bg-gray-50" : "bg-yellow-50"}`}
                                    onClick={() => handleRead(notif.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <strong className="text-blue-700">{notif.title}</strong>
                                        <button
                                            className="opacity-60 group-hover:opacity-100 text-lg hover:text-red-500 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notif.id);
                                            }}
                                            aria-label="Bildirim Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="text-gray-700 text-sm">{notif.message}</div>
                                    <div className="text-xs text-gray-400 mt-1">{notif.timestamp}</div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
