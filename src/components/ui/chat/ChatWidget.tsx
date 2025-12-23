// src/components/chat/ChatWidget.tsx
'use client';

import React, { useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useInputAttachments } from '@/src/hooks/useInputAttachments';
import { useWebSocket } from '@/src/hooks/useWebSocket';
import { useChatWidget } from '@/src/hooks/useChatWidget';
import { useChat } from '@/src/hooks/useChat';
import { useAuth } from '@/src/hooks/login/useAuth';
import { InputAttachment, UserAccount, SavedAccount, ChatNotificationSendRequest } from '@/src/types/chat';
import { FloatingChatButton } from './FloatingChatButton';
import { ChatPanel } from './ChatPanel';

interface ChatWidgetProps {
    defaultOpen?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
    defaultOpen = false
}) => {
    const { isOpen, toggle, close } = useChatWidget({ defaultOpen });
    const { user } = useAuth();
    const {
        messages,
        isLoading,
        sendMessage,
        addMessage
    } = useChat();

    const {
        attachments,
        addAttachment,
        removeAttachment,
        clearAttachments
    } = useInputAttachments();

    useWebSocket({
        userId: user?.id,
        onMessageReceived: useCallback((notification: ChatNotificationSendRequest) => {
            console.log('Notification Received:', notification);

            // Skip adding text message for 'qr' type - QR will be shown via qr-generated event
            if (notification.type === 'qr') {
                console.log('QR notification - waiting for qr-generated event');
                return;
            }

            addMessage({
                id: `notif-${Date.now()}`,
                role: 'assistant',
                content: notification.message,
                timestamp: new Date(notification.time || Date.now()),
                type: 'text',
                data: notification.arguments
            });
        }, [addMessage])
    });

    // Listen for QR generated events from PopUpMap
    useEffect(() => {
        const handleQrGenerated = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            console.log('QR Generated event received:', detail);

            if (detail?.qrUrl) {
                addMessage({
                    id: `qr-${Date.now()}`,
                    role: 'assistant',
                    content: detail.label || 'QR kodu hazır',
                    timestamp: new Date(),
                    type: 'qr_code',
                    data: { qrUrl: detail.qrUrl, label: detail.label }
                });
            }
        };

        window.addEventListener('qr-generated', handleQrGenerated as EventListener);
        return () => window.removeEventListener('qr-generated', handleQrGenerated as EventListener);
    }, [addMessage]);

    const handleWidgetAction = useCallback((action: string, payload: any) => {
        if (action === 'account_selected') {
            const account = payload as UserAccount | SavedAccount;
            const name = (account as UserAccount).name || (account as SavedAccount).nickname || 'Account';
            const iban = (account as UserAccount).iban || (account as SavedAccount).accountIBAN || '';

            const attachment: InputAttachment = {
                id: `att-${Date.now()}`,
                type: 'account',
                label: name,
                contextText: `I select account ${name} (${iban})`,
                data: account
            };

            addAttachment(attachment);
        } else if (action === 'bank_selected') {
            // User selected a bank - add as chip attachment
            const bankName = payload as string;

            const attachment: InputAttachment = {
                id: `att-bank-${Date.now()}`,
                type: 'bank',
                label: bankName,
                contextText: `I select bank ${bankName}`,
                data: { name: bankName }
            };

            addAttachment(attachment);
        } else if (action === 'transfer_confirmed') {
            // User confirmed the transfer
            sendMessage('Transferi Onaylıyorum.', []);
        } else if (action === 'transfer_rejected') {
            // User rejected the transfer
            sendMessage('Hayır, transferi onaylamıyorum.', []);
        }
    }, [addAttachment, sendMessage]);

    // Handle send - clear attachments after sending
    const handleSendMessage = useCallback((text: string, messageAttachments: InputAttachment[]) => {
        sendMessage(text, messageAttachments);
        clearAttachments();
    }, [sendMessage, clearAttachments]);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <ChatPanel
                        isOpen={isOpen}
                        messages={messages}
                        isLoading={isLoading}
                        attachments={attachments}
                        onAddAttachment={addAttachment}
                        onRemoveAttachment={removeAttachment}
                        onSendMessage={handleSendMessage}
                        onWidgetAction={handleWidgetAction}
                        onClose={close}
                    />
                )}
            </AnimatePresence>

            <FloatingChatButton
                isOpen={isOpen}
                onClick={toggle}
                hasUnreadMessages={false}
            />
        </div>
    );
};