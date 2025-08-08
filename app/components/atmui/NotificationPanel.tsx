'use client';

import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface Notification {
    id: number | string;
    message: string;
    title: string;
    type: string;
    timestamp: string;
}

interface NotificationPanelProps {
    userId: string | number;
}

const NotificationPanel: React.FC<NotificationPanelProps & { position?: React.CSSProperties }> = ({ userId, position }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (clientRef.current) return;

        const socket = new SockJS('http://localhost:8090/notification-websocket');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                console.log("user id: " + userId);

                client.subscribe(`/user/${userId}/notifications`, (message) => {
                    const data = JSON.parse(message.body);

                    const notification: Notification = {
                        id: data.id || Date.now(),
                        message: data.message,
                        title: data.title,
                        type: data.type,
                        timestamp: new Date().toLocaleString()
                    };

                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
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

    const handleDelete = (id: string | number) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const togglePanel = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0); // panel açılınca okunmuş say
        }
    };

    // Varsayılan pozisyon
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
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-fade-in">
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
                                    className="bg-gray-50 rounded-lg p-3 shadow flex flex-col gap-1 relative group">
                                    <div className="flex items-center justify-between">
                                        <strong className="text-blue-700">{notif.title}</strong>
                                        <button
                                            className="opacity-60 group-hover:opacity-100 text-lg hover:text-red-500 transition-colors"
                                            onClick={() => handleDelete(notif.id)}
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