// src/hooks/notification/useNotificationWebSocket.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useMaintenance } from '@/src/providers/MaintenanceProvider';
import { Notification } from '@/src/types/notification';
import * as authService from '@/src/services/authService';
import { useAlert } from "@/src/hooks/notification/useAlert";
import { useConfirmation } from '@/src/providers/ConfirmationProvider';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface UseNotificationWebSocketProps {
    userId: string;
    onNotificationReceived?: (notification: Notification) => void;
}

export function useNotificationWebSocket({ userId, onNotificationReceived }: UseNotificationWebSocketProps) {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const { alert, showAlert } = useAlert();
    const isProcessingRef = useRef(false);
    const { setMaintenance } = useMaintenance();
    const { showConfirmation } = useConfirmation();

    const onNotificationReceivedRef = useRef(onNotificationReceived);
    useEffect(() => {
        onNotificationReceivedRef.current = onNotificationReceived;
    }, [onNotificationReceived]);

    // Ortak mesaj işleme fonksiyonu
    const handleMessage = useCallback((payload: Notification) => {
        // MAINTENANCE mesajını yakala
        if (payload.type === 'MAINTENANCE') {
            const isActive = payload.title === 'TRUE';
            setMaintenance(isActive, payload.message);
            return;
        }

        // FORCE_LOGOUT mesajını yakala
        if (payload.type === 'FORCE_LOGOUT') {
            console.log('🚫 Zorla çıkış yapılıyor:', payload.message);
            showAlert('warning', 'Oturum Sonlandırıldı', payload.message);
            authService.logout();
            return;
        }

        // CONFIRMATION_REQUIRED mesajını yakala
        if (payload.type === 'CONFIRMATION_REQUIRED') {
            console.log('⚠️ İşlem onayı gerekiyor:', payload);
            const transactionId = payload.arguments?.transactionId as string || '';
            showConfirmation({
                transactionId: transactionId,
                message: payload.message,
                title: payload.title,
                timestamp: String(payload.timestamp),
            });
        }

        // Normal bildirim
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
    }, [setMaintenance, showConfirmation]);

    const connect = useCallback(async () => {
        if (!userId) return;

        try {
            const res = await fetch('/api/notification/socket/notification', {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('User not authorized');
            const data = await res.json();

            const socket = new SockJS(`${API_BASE_URL}/notification/notification-websocket`);

            const client = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log('✅ Notification WebSocket bağlandı');
                    setIsConnected(true);

                    // 1️⃣ Kullanıcıya özel bildirimler
                    client.subscribe(`/user/${data.userId}/notifications`, (message) => {
                        if (isProcessingRef.current) return;
                        isProcessingRef.current = true;
                        try {
                            const payload = JSON.parse(message.body);
                            handleMessage(payload);
                        } finally {
                            setTimeout(() => {
                                isProcessingRef.current = false;
                            }, 100);
                        }
                    });

                    // 2️⃣ Broadcast - Tüm kullanıcılara (Bakım modu vb.)
                    client.subscribe('/topic/broadcast', (message) => {
                        try {
                            const payload = JSON.parse(message.body);
                            console.log('📢 Broadcast mesajı alındı:', payload);
                            handleMessage(payload);
                        } catch (e) {
                            console.error('Broadcast mesaj parse hatası:', e);
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
    }, [userId, handleMessage]);

    useEffect(() => {
        connect();
        return () => {
            if (clientRef.current) clientRef.current.deactivate();
        };
    }, [connect]);

    return { isConnected };
}