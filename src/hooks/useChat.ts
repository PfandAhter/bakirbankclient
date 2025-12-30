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
    // Track pending transfer context for when confirmation comes in a separate message
    const pendingTransferContextRef = useRef<{
        fromIBAN?: string;
        toIBAN?: string;
        toFirstName?: string;
        toSecondName?: string;
        toLastName?: string;
        amount?: number;
        timestamp?: number;
    } | null>(null);

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

            console.log('[useChat] Full response data:', JSON.stringify(data, null, 2));

            // Handle Assistant Response
            if (data.message) {
                const botMsg: ChatMessage = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'assistant',
                    content: data.message.content || '',
                    timestamp: new Date(),
                    type: 'text'
                };

                // Handle Pending Widgets (Tool Results) - Check both pendingRequest and lastToolResult
                const pendingRequest = data.pendingRequest;
                const lastToolResult = data.lastToolResult || data.toolResult;

                console.log('[useChat] pendingRequest:', pendingRequest);
                console.log('[useChat] lastToolResult:', lastToolResult);

                if (pendingRequest) {
                    const fnName = pendingRequest.function;
                    const args = pendingRequest.arguments;

                    console.log('Widget Triggered (pendingRequest):', fnName, args);

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
                        // Handle both PENDING_CONFIRMATION and VALIDATION_SUCCESS
                        if (args.status === 'PENDING_CONFIRMATION' || args.processCode === 'VALIDATION_SUCCESS') {
                            botMsg.type = 'transfer_confirmation';
                            // Build preview data from args if not provided
                            botMsg.data = args.preview || {
                                fromAccountIban: args.fromIBAN,
                                toIban: args.toIBAN,
                                toName: [args.toFirstName, args.toSecondName, args.toLastName].filter(Boolean).join(' '),
                                amount: args.amount,
                                currency: 'TRY',
                                description: args.description || args.processMessage
                            };
                        } else {
                            botMsg.type = 'transfer_result';
                            botMsg.data = args;
                        }
                    }
                } else if (lastToolResult) {
                    // Fallback: Extract widget data from lastToolResult
                    const fnName = lastToolResult.function || lastToolResult.name;
                    const result = lastToolResult.result || lastToolResult.data || lastToolResult;
                    // Also get the original arguments from the tool call
                    const toolArgs = lastToolResult.arguments || {};

                    console.log('Widget Triggered (lastToolResult):', fnName, result);

                    if (fnName === 'get_user_accounts' && result.accounts) {
                        botMsg.type = 'account_selection';
                        botMsg.data = { accounts: result.accounts };
                    } else if ((fnName === 'get_saved_accounts' || fnName === 'get_saved_accounts_for_transfer') && result.savedAccounts) {
                        botMsg.type = 'account_selection';
                        botMsg.data = { accounts: result.savedAccounts };
                    } else if ((fnName === 'get_bank_names' || fnName === 'bank_name_list') && result.banks) {
                        botMsg.type = 'bank_name_list';
                        botMsg.data = { banks: result.banks };
                    } else if (fnName === 'transaction_list' && result.transactions) {
                        botMsg.type = 'transaction_list';
                        botMsg.data = { transactions: result.transactions };
                    } else if (fnName === 'transfer_money') {
                        // Handle VALIDATION_SUCCESS or PENDING_CONFIRMATION from result
                        if (result.status === 'PENDING_CONFIRMATION' ||
                            result.processCode === 'VALIDATION_SUCCESS' ||
                            result.status === '1') {
                            botMsg.type = 'transfer_confirmation';
                            // Build preview data from toolArgs and result
                            botMsg.data = result.preview || {
                                fromAccountIban: toolArgs.fromIBAN,
                                toIban: toolArgs.toIBAN,
                                toName: [toolArgs.toFirstName, toolArgs.toSecondName, toolArgs.toLastName].filter(Boolean).join(' '),
                                amount: toolArgs.amount,
                                currency: 'TRY',
                                description: toolArgs.description || result.processMessage
                            };
                        } else if (result.status) {
                            botMsg.type = 'transfer_result';
                            botMsg.data = result;
                        }
                    }
                }

                // Fallback: Detect transfer confirmation from message content pattern
                // This handles cases where the backend doesn't send separate lastToolResult data
                if (botMsg.type === 'text' && botMsg.content) {
                    const confirmationPatterns = [
                        /transfer özeti/i,
                        /onaylıyor musunuz/i,
                        /doğrulanmıştır.*onaylıyor/i,
                        /işlem ücreti/i,
                        /transfer.*onay/i
                    ];

                    const containsConfirmation = confirmationPatterns.some(pattern =>
                        pattern.test(botMsg.content)
                    );

                    // Check if we have transfer data from a previous message or session data
                    if (containsConfirmation && data.transferPreview) {
                        console.log('[useChat] Detected transfer confirmation from text content');
                        botMsg.type = 'transfer_confirmation';
                        botMsg.data = data.transferPreview;
                    } else if (containsConfirmation && data.lastToolCall) {
                        // Try to extract from lastToolCall if available
                        const toolCall = data.lastToolCall;
                        if (toolCall.name === 'transfer_money' && toolCall.args) {
                            console.log('[useChat] Building transfer preview from lastToolCall args');
                            botMsg.type = 'transfer_confirmation';
                            botMsg.data = {
                                fromAccountIban: toolCall.args.fromIBAN,
                                toIban: toolCall.args.toIBAN,
                                toName: [toolCall.args.toFirstName, toolCall.args.toSecondName, toolCall.args.toLastName].filter(Boolean).join(' '),
                                amount: toolCall.args.amount,
                                currency: 'TRY',
                                description: toolCall.args.description
                            };
                        }
                    } else if (containsConfirmation && pendingTransferContextRef.current) {
                        // Use stored transfer context from previous tool call
                        const ctx = pendingTransferContextRef.current;
                        // Only use if context is recent (within last 60 seconds)
                        if (ctx.timestamp && (Date.now() - ctx.timestamp) < 60000) {
                            console.log('[useChat] Using pendingTransferContext for confirmation');
                            botMsg.type = 'transfer_confirmation';
                            botMsg.data = {
                                fromAccountIban: ctx.fromIBAN,
                                toIban: ctx.toIBAN,
                                toName: [ctx.toFirstName, ctx.toSecondName, ctx.toLastName].filter(Boolean).join(' '),
                                amount: ctx.amount,
                                currency: 'TRY',
                            };
                            // Clear the context after use
                            pendingTransferContextRef.current = null;
                        }
                    }
                }

                // Store transfer context if we detected a transfer_money call (for later confirmation)
                if (lastToolResult) {
                    const fnName = lastToolResult.function || lastToolResult.name;
                    const toolArgs = lastToolResult.arguments || {};
                    if (fnName === 'transfer_money' && toolArgs.fromIBAN) {
                        pendingTransferContextRef.current = {
                            fromIBAN: toolArgs.fromIBAN,
                            toIBAN: toolArgs.toIBAN,
                            toFirstName: toolArgs.toFirstName,
                            toSecondName: toolArgs.toSecondName,
                            toLastName: toolArgs.toLastName,
                            amount: toolArgs.amount,
                            timestamp: Date.now()
                        };
                        console.log('[useChat] Stored pending transfer context:', pendingTransferContextRef.current);
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
                content: 'Üzgünüm, işleminizi şuan gerçekleştiremiyorum. Lütfen daha sonra tekrar deneyiniz.',
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
