'use client';

import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import axios from 'axios';
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
    const [unreadCount, setUnreadCount] = useState(0);
    const clientRef = useRef<Client | null>(null);
    const channel = new BroadcastChannel("notifications");

    useEffect(() => {
        channel.onmessage = (event) => {
            if (event.data.type === "INIT_NOTIFICATIONS") {
                setNotifications(event.data.payload);
                setUnreadCount(event.data.payload.filter((n: Notification) => !n.isRead).length);
            }
            if (event.data.type === "NEW_NOTIFICATION") {
                const notification: Notification = event.data.payload;
                setNotifications(prev => [notification, ...prev]);
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
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
        };
    }, []);

    useEffect(() => {
        let retryInterval: NodeJS.Timeout | null = null;

        async function fetchNotifications() {
            try {
                const res = await axios.get(`http://localhost:8090/api/v1/notification/get`, {
                    params: { userId }
                });

                console.log("Fetch Notifications Response data: ", res);

                const data = res.data.notifications;
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length);

                // Diğer sekmeler için senkronizasyon
                channel.postMessage({ type: "INIT_NOTIFICATIONS", payload: data });

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
        if (clientRef.current) return;

        const socket = new SockJS('http://localhost:8090/notification-websocket');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket');

                client.subscribe(`/user/${userId}/notifications`, (message) => {
                    const data = JSON.parse(message.body);

                    console.log("Notifications:",data);

                    const notification: Notification = {
                        id: data.id,
                        message: data.message,
                        title: data.title,
                        type: data.type,
                        timestamp: data.timestamp,
                        isRead: false
                    };

                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    channel.postMessage({
                        type: "NEW_NOTIFICATION",
                        payload: notification
                    });
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (client && client.connected) {
                client.deactivate();
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
            const res = axios.delete(`http://localhost:8090/api/v1/notification/delete`, {
                params: {
                    notificationId:id
                }
            });
            setNotifications(prev => prev.filter(notif => notif.id !== id));

            channel.postMessage({ type: "DELETE_NOTIFICATION", payload: id });
        } catch (err) {
            console.error("Silme hatası:", err);
        }
    };

    const handleRead = async (id: number) => {
        try {
            await axios.patch(`http://localhost:8090/api/v1/notification/${id}/read`);

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, isRead: true } : notif
                )
            );
            //setUnreadCount(prev => Math.max(prev - 1, 0));

            channel.postMessage({ type: "READ_NOTIFICATION", payload: id });
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
