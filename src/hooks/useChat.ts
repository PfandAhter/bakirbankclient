// src/hooks/useChat.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage, InputAttachment } from '@/src/types/chat';

interface UseChatReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    sessionId: string;
    sendMessage: (displayText: string, attachments?: InputAttachment[]) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    clearMessages: () => void;
}

export function useChat(): UseChatReturn {

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sessionIdRef = useRef(`session-${Date.now()}`);

    const sendMessage = useCallback(async (displayText: string, attachments: InputAttachment[] = []) => {
        // Build the backend message with attachment context
        const attachmentContext = attachments
            .map(a => a.contextText)
            .join(' ');

        const backendMessage = attachmentContext
            ? `${displayText} ${attachmentContext}`.trim()
            : displayText;

        // If no display text but has attachments, use a generic message for display
        const userDisplayContent = displayText ||
            (attachments.length > 0 ? attachments.map(a => a.label).join(', ') : '');

        if (!backendMessage.trim()) return;

        // Optimistic User Message - show only what user typed
        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: userDisplayContent,
            timestamp: new Date(),
            type: 'text'
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionIdRef.current,
                    message: backendMessage
                    // userId/userEmail extracted from auth cookie on server-side
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Handle Assistant Response
            if (data.message) {
                const botMsg: ChatMessage = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'assistant',
                    content: data.message.content || '',
                    timestamp: new Date(),
                    type: 'text'
                };

                // Handle Pending Widgets (Tool Results)
                if (data.pendingRequest) {
                    const fnName = data.pendingRequest.function;
                    const args = data.pendingRequest.arguments;

                    console.log('Widget Triggered:', fnName, args);

                    if (fnName === 'get_user_accounts') {
                        botMsg.type = 'account_selection';
                        botMsg.data = args;
                    } else if (fnName === 'get_saved_accounts' || fnName === 'get_saved_accounts_for_transfer') {
                        botMsg.type = 'account_selection';
                        botMsg.data = { accounts: args.savedAccounts };
                    } else if (fnName === 'get_bank_names' || fnName === 'bank_name_list') {
                        botMsg.type = 'bank_name_list';
                        botMsg.data = { banks: args.banks || args };
                    } else if (fnName === 'transaction_list') {
                        botMsg.type = 'transaction_list';
                        botMsg.data = args;
                    } else if (fnName === 'transfer_money') {
                        if (args.status === 'PENDING_CONFIRMATION') {
                            botMsg.type = 'transfer_confirmation';
                            botMsg.data = args.preview;
                        } else {
                            botMsg.type = 'transfer_result';
                            botMsg.data = args;
                        }
                    }
                }

                setMessages(prev => [...prev, botMsg]);
            }
        } catch (err) {
            console.error('Chat error', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);

            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, I encountered an error connecting to the bank services. Please try again.',
                timestamp: new Date(),
                type: 'text'
            }]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    const addMessage = useCallback((message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sessionId: sessionIdRef.current,
        sendMessage,
        addMessage,
        clearMessages
    };
}
