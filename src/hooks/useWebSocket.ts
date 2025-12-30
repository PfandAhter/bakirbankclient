// src/hooks/useWebSocket.ts
'use client';

import {useEffect, useRef, useState} from 'react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {ChatNotificationSendRequest} from '../types/chat';
import {useMaintenance} from '../providers/MaintenanceProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface UseWebSocketProps {
    userId?: string;
    onMessageReceived?: (message: ChatNotificationSendRequest) => void;
}

export function useWebSocket({userId, onMessageReceived}: UseWebSocketProps = {}) {
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const {setMaintenance} = useMaintenance();

    const onMessageReceivedRef = useRef(onMessageReceived);
    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        if (!userId) return;

        const WS_URL = `${API_BASE_URL}/notification/chat-websocket`;
        const socket = new SockJS(WS_URL);

        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('✅ WebSocket bağlandı');
                setIsConnected(true);

                const topic = `/user/chat/model/${userId}/notifications`;
                client.subscribe(topic, (message) => {
                    try {
                        const body = JSON.parse(message.body);

                        if (body.type === 'MAINTENANCE') {
                            setMaintenance(body.isActive, body.message);
                            return;
                        }

                        if (body.type === 'qr' && body.arguments) {
                            window.dispatchEvent(new CustomEvent('qr-request', {
                                detail: {
                                    atmId: body.arguments.atmId,
                                    latitude: Number(body.arguments.atmLatitude),
                                    longitude: Number(body.arguments.atmLongitude),
                                    userLatitude: Number(body.arguments.userLatitude),
                                    userLongitude: Number(body.arguments.userLongitude)
                                }
                            }));
                        }

                        if (onMessageReceivedRef.current) {
                            onMessageReceivedRef.current(body);
                        }
                    } catch (e) {
                        console.error('WebSocket mesaj hatası:', e);
                    }
                });
            },
            onDisconnect: () => {
                console.log('🔌 WebSocket bağlantı kesildi');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('WebSocket STOMP hatası:', frame.headers['message']);
            },
            onWebSocketError: (event) => {
                console.error('WebSocket hatası:', event);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) clientRef.current.deactivate();
        };
    }, [userId, setMaintenance]);

    return {isConnected};
}