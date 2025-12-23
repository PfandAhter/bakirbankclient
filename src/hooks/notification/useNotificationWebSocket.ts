'use client';

import {useEffect, useRef, useState, useCallback} from 'react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {useMaintenance} from '@/src/providers/MaintenanceProvider';
import {Notification} from '@/src/types/notification';
import { useAuth } from '@/src/hooks/login/useAuth';

interface UseNotificationWebSocketProps {
    userId: string;
    onNotificationReceived?: (notification: Notification) => void;
}

export function useNotificationWebSocket({userId, onNotificationReceived}: UseNotificationWebSocketProps) {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const isProcessingRef = useRef(false);
    const {setMaintenance} = useMaintenance();
    const {logout} = useAuth();

    const onNotificationReceivedRef = useRef(onNotificationReceived);
    useEffect(() => {
        onNotificationReceivedRef.current = onNotificationReceived;
    }, [onNotificationReceived]);

    const connect = useCallback(async () => {
        if (!userId) return;

        try {
            const res = await fetch('/api/notification/socket/notification', {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('User not authorized');
            const data = await res.json();

            const socket = new SockJS('http://localhost:8080/notification/notification-websocket');

            const client = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log('✅ Notification WebSocket bağlandı');
                    setIsConnected(true);

                    client.subscribe(`/user/${data.userId}/notifications`, (message) => {
                        if (isProcessingRef.current) return;
                        isProcessingRef.current = true;

                        try {
                            const payload = JSON.parse(message.body);

                            if (payload.type === 'MAINTENANCE') {
                                const isActive = payload.title === 'TRUE';
                                setMaintenance(isActive, payload.message);
                                return;
                            }

                            if (payload.type === 'FORCE_LOGOUT') {
                                console.log('🚫 Zorla çıkış yapılıyor:', payload.message);

                                alert(payload.message || 'Oturumunuz sonlandırıldı.');
                                logout();
                                return;
                            }

                            const notification: Notification = {
                                id: payload.id,
                                message: payload.message,
                                title: payload.title,
                                type: payload.type,
                                timestamp: payload.timestamp,
                                isRead: payload.isRead ?? false,
                            };

                            if (onNotificationReceivedRef.current) {
                                onNotificationReceivedRef.current(notification);
                            }
                        } finally {
                            setTimeout(() => {
                                isProcessingRef.current = false;
                            }, 100);
                        }
                    });
                },
                onDisconnect: () => {
                    setIsConnected(false);
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame.headers['message']);
                },
            });

            client.activate();
            clientRef.current = client;
        } catch (error) {
            console.error('❌ Notification WebSocket setup failed:', error);
        }
    }, [userId, setMaintenance, logout]);

    useEffect(() => {
        connect();
        return () => {
            if (clientRef.current) clientRef.current.deactivate();
        };
    }, [connect]);

    return {isConnected};
}