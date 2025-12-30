// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
// import {Message} from '@/app/types/Message'; // Assumed internal type
// import {MessageRenderer} from '@/app/components/chat/MessageRenderer'; // Assumed component
// import {SelectedAccountChip} from '@/app/components/chat/SelectedAccountChip'; // Assumed component
import { io, Socket } from 'socket.io-client';
import { Message, MessageType } from "@/app/types/Message"; // npm install socket.io-client
// import PopUpMap from "@/app/popup-test/page"; // Assumed component

// Placeholder Mocks for missing imports if running standalone
const PopUpMap = () => null;
const SelectedAccountChip = ({ accounts, onRemove }: any) => (
    <div className="flex bg-purple-100 rounded-full px-2 py-1 text-xs items-center gap-1" >
        <span>{accounts[0]?.name} </span>
        < button onClick={() => onRemove(accounts[0]?.id)} className="text-purple-600" > x </button>
    </div>
);

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: crypto.randomUUID(),
            role: 'assistant',
            type: 'text',
            content: 'Merhaba 👋 Ben BAKIRBANK işlem asistanınızım. Ne yapmak istersiniz?',
            timestamp: new Date().toISOString(),
        },
    ]);

    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<{ id: string; name: string; iban: string } | null>(null);
    const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string; iban: string } | null>(null);
    const [selectedAccountChip, setSelectedAccountChip] = useState<{
        id: string;
        name: string;
        iban?: string
    }[] | null>(null);
    const [globalArgs, setGlobalArgs] = useState<Record<string, any>>({});
    const [isAssistantOnline, setIsAssistantOnline] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [pendingArgs, setPendingArgs] = useState<Record<string, any> | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [activeIntent, setActiveIntent] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<string | null>(null);
    const [pendingRequestOptions, setPendingRequestOptions] = useState<Record<string, unknown> | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages, isTyping]);
    const socketRef = useRef<Socket | null>(null);

    // Initialize Session ID
    const getSessionId = () => {
        if (typeof window !== 'undefined') {
            let sid = localStorage.getItem('chat_session_id');
            if (!sid) {
                sid = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                localStorage.setItem('chat_session_id', sid);
            }
            return sid;
        }
        return 'default-session';
    };

    const sessionId = getSessionId();

    useEffect(() => {
        setIsConnecting(true);

        // Connect to Socket.IO backend
        const socket = io('http://localhost:8090/chat', {
            query: { sessionId },
            transports: ['websocket'],
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Connected to Chat WebSocket');
            setIsAssistantOnline(true);
            setIsConnecting(false);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from Chat WebSocket');
            setIsAssistantOnline(false);
        });

        // Listen for AI messages pushed from server (if any)
        socket.on('ai_message', (payload: any) => {
            console.log('Received AI Message via Socket:', payload);
            // We usually handle response in HTTP return, but this is good for async notifications
            // or if the server pushes a message later
            const newMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                type: 'text',
                content: payload.text,
                timestamp: payload.timestamp || new Date().toISOString(),
            };
            setMessages(prev => [...prev, newMsg]);
        });

        // Listen for tool usage
        socket.on('tools_used', (payload: any) => {
            console.log('Tools used:', payload.tools);
        });

        socket.on('error', (err: any) => {
            console.error('Socket error:', err);
        });

        return () => {
            socket.disconnect();
        };
    }, [sessionId]);


    // Helper to handle custom events (like QR generation if triggered externally)
    useEffect(() => {
        const handler = (e: Event) => {
            try {
                const detail = (e as CustomEvent).detail;
                if (!detail) return;
                const { qrUrl, label } = detail as { imageUrl: string; qrUrl: string; label?: string };

                const qrMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    type: 'qr',
                    content: label || 'QR kodu hazır.',
                    data: qrUrl,
                    label: label,
                    timestamp: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, qrMessage]);
            } catch (err) {
                console.error('qr-generated handler error', err);
            }
        };

        window.addEventListener('qr-generated', handler as EventListener);

        return () => {
            window.removeEventListener('qr-generated', handler as EventListener);
        };
    }, []);

    const sendRestMessage = async (
        messageSnapshot: Message[],
        customArgs?: Record<string, any>
    ) => {
        try {
            setIsTyping(true);

            // Get the LAST user message to send
            const lastUserMessage = messageSnapshot.filter(m => m.role === 'user').pop();
            if (!lastUserMessage) {
                setIsTyping(false);
                return;
            }

            const body = {
                sessionId,
                message: lastUserMessage.content,
                // arguments: mergedArgs // ChatController simplified doesnt accept args yet,
                // typically context is embedded in prompt or handled via separate context endpoint
            };

            const res = await fetch('http://localhost:8090/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            setIsTyping(false);

            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            console.log("MCP/Chat RESPONSE DATA:", data);

            // Handle Pending Requests (Confirmation cards, etc)
            if (data.pendingRequest) {
                // The backend mapped lastToolResult to pendingRequest
                const pr = data.pendingRequest;

                // Update global args if arguments are present
                if (pr.arguments) {
                    setGlobalArgs((prev) => ({
                        ...prev,
                        ...pr.arguments,
                    }));
                    setPendingArgs(pr.arguments);
                }

                if (pr.function) {
                    setActiveIntent(pr.function);
                    setMessageType(pr.function); // e.g., 'confirm_transfer', 'get_user_accounts'
                }

                if (pr.options) {
                    setPendingRequestOptions(pr.options);
                }
            } else {
                // Reset if no pending request
                setMessageType(null);
                setPendingRequestOptions(null);
            }

            // Handle the main AI response message
            if (data.message) {
                const msg: Message = {
                    id: crypto.randomUUID(),
                    role: data.message.role,
                    type: data.pendingRequest?.function as MessageType || 'text', // Use function name as type if available
                    content: data.message.content,
                    timestamp: new Date().toISOString()
                };
                setMessages((prev) => [...prev, msg]);
            }

        } catch (err) {
            console.error(err);
            setIsTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    type: 'notification',
                    title: 'Hata',
                    message: 'Sunucuya bağlanırken bir hata oluştu.',
                    level: 'error',
                },
            ]);
        }
    };

    useEffect(() => {
        setSelectedAccountChip((prev) => {
            const items: any[] = prev ? [...prev] : [];
            if (selectedAccount) {
                const exists = items.some((a) => a.id === selectedAccount.id);
                if (!exists) items.push(selectedAccount);
            }
            if (selectedRecipient) {
                const exists = items.some((a) => a.id === selectedRecipient.id);
                if (!exists) items.push(selectedRecipient);
            }
            return items.length ? items : null;
        });
    }, [selectedAccount, selectedRecipient]);


    const handleAccountSelect = (selection: string) => {
        console.log("ACCOUNT OR ACTION SELECTED:", selection);

        // ✅ 1. Eğer kullanıcı hesap seçtiyse
        const allAccountsMsg = messages.find(
            (m) =>
                m.type === 'get_user_accounts' &&
                (pendingRequestOptions?.data as any)?.accounts?.some((a: any) => a.id === selection)
        );
        // Fallback search in pendingRequestOptions if message parsing fails context
        const accountsData = (pendingRequestOptions?.data as any)?.accounts;
        const selected = accountsData?.find((a: any) => a.id === selection);

        console.log("selected: ", selected);
        if (selected) {
            setSelectedAccount({ id: selected.id, name: selected.name, iban: selected.iban });
            return;
        }

        // ✅ 2. Eğer kayıtlı alıcı seçtiyse
        type SavedAccount = { accountIBAN: string; id?: string; firstName?: string; lastName?: string };
        const savedAccountsData = (pendingRequestOptions?.data as any)?.savedAccounts;

        const selectedRecipientData = savedAccountsData?.find(
            (a: SavedAccount) => a.accountIBAN === selection
        );

        if (selectedRecipientData) {
            setSelectedRecipient({
                id: `${selectedRecipientData.id}`,
                name: `${selectedRecipientData.firstName} ${selectedRecipientData.lastName}`,
                iban: selectedRecipientData.accountIBAN,
            });
            return;
        }

        // ✅ 3. Eğer CONFIRM_TRANSFER aşamasındaysa
        if (selection === 'CONFIRM_TRANSFER_YES' || selection === 'CONFIRM_TRANSFER_NO') {
            const isConfirm = selection === 'CONFIRM_TRANSFER_YES';
            const newMsg: Message = {
                id: crypto.randomUUID(),
                role: 'user',
                type: 'text',
                content: isConfirm ? 'Evet, onaylıyorum.' : 'Hayır, iptal et.',
                timestamp: new Date().toISOString(),
            };

            // If checking globalArgs for context
            const transferContext = globalArgs; // Contains fromIBAN, toIBAN etc.

            setMessages((prev) => [...prev, newMsg]);

            // Send confirmation logic
            // Since our backend expects text, we send the text.
            // The LLM history will know we are in a confirmation state if configured correctly.
            sendRestMessage([...messages, newMsg], { confirm: isConfirm });
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const namesFromChips = selectedAccountChip?.map(a => a.name).filter(Boolean) ?? [];
        const singleName = selectedAccount ? [selectedAccount.name] : [];
        const namesToUse = namesFromChips.length ? namesFromChips : singleName;
        const prefix = namesToUse.length ? namesToUse.join(' ') : '';

        const raw = inputValue.trim();
        const normalizedRaw = raw;
        const normalizedPrefix = prefix.trim();

        let finalContent = normalizedRaw;
        // Context injection via text prefixing
        if (normalizedPrefix) {
            const startsWithPrefix = normalizedRaw.startsWith(normalizedPrefix + ' ');
            if (!startsWithPrefix) {
                finalContent = `${normalizedPrefix} ${normalizedRaw}`;
            }
        }

        // Context injection from selected recipient
        if (selectedRecipient) {
            finalContent += ` (Alıcı: ${selectedRecipient.name}, IBAN: ${selectedRecipient.iban})`;
        }

        const newMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            type: 'text',
            content: finalContent,
            timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        setInputValue('');

        const args = buildArgs();
        await sendRestMessage(updatedMessages, args);

        setSelectedAccount(null);
        setSelectedRecipient(null); // Clear selections after send
    };

    const buildArgs = (): Record<string, unknown> => {
        const args: Record<string, unknown> = {};

        if (selectedAccount?.id) args.accountId = selectedAccount.id;
        if (selectedAccount?.iban) args.fromIBAN = selectedAccount.iban;
        if (selectedRecipient?.iban) args.toIBAN = selectedRecipient.iban;

        return args;
    };

    useEffect(() => {
        console.log("🌐 Global Args Updated:", globalArgs);
    }, [globalArgs]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Floating Button with Glow Effect */}
            < div className="fixed bottom-6 right-6 z-50" >
                <PopUpMap />
                < div className="relative" >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-75 blur-xl animate-pulse" > </div>

                    < button
                        onClick={() => setIsOpen(!isOpen)
                        }
                        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
                    >
                        {
                            isOpen ? (
                                <X className="w-7 h-7 transition-transform group-hover:rotate-90 duration-300" />
                            ) : (
                                <MessageCircle className="w-7 h-7" />
                            )}
                    </button>
                </div>
            </div>

            {/* Chat Window */}
            {
                isOpen && (
                    <div className="fixed bottom-24 right-6 w-[450px] h-[650px] z-50 flex flex-col overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl bg-white/95 border border-purple-100" >
                        {/* Header */}
                        < div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white p-6 overflow-hidden" >
                            <div className="relative flex items-center gap-4" >
                                <div className="relative" >
                                    <div className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg" >
                                        💬
                                    </div>
                                    < div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-purple-600 animate-pulse ${isAssistantOnline ? 'bg-green-400' : 'bg-red-400'}`
                                    }> </div>
                                </div>
                                < div className="flex-1" >
                                    <div className="flex items-center gap-2" >
                                        <h3 className="text-lg font-bold" > BAKIRBANK Asistan </h3>
                                        < Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                                    </div>
                                    < p className="text-sm text-purple-100" >
                                        {isConnecting ? 'Bağlanıyor...' : (isAssistantOnline ? 'Çevrimiçi' : 'Çevrimdışı')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 via-purple-50/30 to-indigo-50/30" >
                            {
                                messages.map((msg, idx) => (
                                    <div key={msg.id} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} >
                                        <div className={
                                            `max-w-[90%] px-5 py-3.5 rounded-2xl shadow-lg backdrop-blur-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-purple-200' : 'bg-white/90 text-gray-800'
                                            }`
                                        }>
                                            <MessageRenderer
                                                message={msg}
                                                pendingRequestOptions={pendingRequestOptions}
                                                messageType={msg.type === 'text' && msg.id === messages[messages.length - 1].id ? messageType : msg.type}
                                                globalArgs={globalArgs}
                                                onAccountSelect={handleAccountSelect}
                                            />
                                            {
                                                msg.timestamp && (
                                                    <span className={`text-xs mt-2 block ${msg.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            {
                                isTyping && (
                                    <div className="flex justify-start mb-4" >
                                        <div className="bg-white/90 px-4 py-3 rounded-2xl shadow" >
                                            <div className="flex gap-1" >
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" > </span>
                                                < span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" > </span>
                                                < span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" > </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-purple-100/50" >
                            <div className="flex gap-3 items-center" >
                                <div className="flex items-center flex-1 px-4 py-3 rounded-2xl border-2 border-purple-200/50 focus-within:border-purple-500 bg-white/60" >
                                    {(selectedAccountChip || selectedAccount || selectedRecipient) && (
                                        <SelectedAccountChip
                                            accounts={selectedAccountChip || (selectedAccount ? [selectedAccount] : [])}
                                            onRemove={() => { setSelectedAccount(null); setSelectedAccountChip(null); }}
                                        />
                                    )}
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Mesajınızı yazın..."
                                        className="flex-1 bg-transparent outline-none ml-2"
                                    />
                                </div>
                                < button onClick={handleSend} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg" >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
}