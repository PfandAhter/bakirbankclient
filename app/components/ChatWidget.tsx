'use client';

import React, {useState, useRef, useEffect} from 'react';
import {MessageCircle, X, Send, Sparkles} from 'lucide-react';
import {Message} from '@/app/types/Message';
import {MessageRenderer} from '@/app/components/chat/MessageRenderer';
import {SelectedAccountChip} from '@/app/components/chat/SelectedAccountChip';
import SockJS from "sockjs-client";
import {Client} from "@stomp/stompjs";
import PopUpMap from "@/app/popup-test/page";

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
    const [pendingArgs, setPendingArgs] = useState<Record<string, any> | null>(null);
    const [activeIntent, setActiveIntent] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<string | null>(null);
    const [pendingRequestOptions, setPendingRequestOptions] = useState<Record<string, unknown> | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    useEffect(() => scrollToBottom(), [messages, isTyping]);


    useEffect(() => {
        let client: Client | null = null;

        async function setupWebSocket() {
            setIsConnecting(true);
            try {
                // userId’yi cookie'den alan route’tan iste
                const res = await fetch('/api/notification/socket/notification', {
                    method: 'POST',
                    credentials: 'include', // ✅ Cookie'yi gönder
                });

                if (!res.ok) throw new Error('User not authorized');
                const data = await res.json();

                const chatSocket = new SockJS('http://localhost:8080/notification/chat-websocket');

                // Update assistant online state when underlying socket errors or closes
                ;(chatSocket as any).onclose = (e: any) => {
                    console.error('SockJS closed:', e);
                    setIsAssistantOnline(false);
                };
                ;(chatSocket as any).onerror = (err: any) => {
                    console.error('SockJS error:', err);
                    setIsAssistantOnline(false);
                };

                client = new Client({
                    webSocketFactory: () => chatSocket,
                    reconnectDelay: 1000,
                    onConnect: () => {
                        setIsAssistantOnline(true);
                        setIsConnecting(false);
                        console.log('✅ Connected to Chat Notification WebSocket');

                        client?.subscribe(`/user/chat/model/${data.userId}/notifications`, (message) => {
                            const payload = JSON.parse(message.body);


                            if (payload.type === 'qr') {
                                // örn payload: { type: 'qr', atmId: 'atm-123', latitude: 39.1, longitude: 32.8, label: '...' }
                                console.log('📢 QR generation request received via WS:', payload);

                                // Basit doğrulama (optional): sadece yetkili origin'lerden geliyorsa işleme al
                                // Dispatch event so PopUpMap can handle generating the snapshot and QR
                                window.dispatchEvent(new CustomEvent('qr-request', {detail: payload}));

                                // Ayrıca chat'e görsel bilgilendirme mesajı da atmak isterseniz:
                                setMessages((prev) => [
                                    ...prev,
                                    {
                                        id: crypto.randomUUID(),
                                        role: 'assistant',
                                        type: 'notification',
                                        title: 'QR oluşturuluyor',
                                        message: `${payload.label ?? 'Harita görüntüsü'} için QR oluşturuluyor...`,
                                        level: 'info',
                                        timestamp: new Date().toISOString(),
                                    } as any,
                                ]);
                                return;
                            }

                            // payload.message burada string, o yüzden doğrudan kullan
                            const notificationMessage: Message = {
                                id: crypto.randomUUID(),
                                role: 'assistant',
                                type: payload.type || 'notification',
                                level: payload.level || 'info',
                                title: payload.title || 'Bildirim',
                                content: payload.message,  // 💡 UI'da göstereceğimiz metin
                                timestamp: payload.time
                            };

                            setMessages((prev) => [...prev, notificationMessage]);
                        });
                    },
                    onStompError: (frame) => {
                        console.error('STOMP error:', frame);
                    },
                });

                setIsConnecting(false);
                setIsAssistantOnline(false);
                client.activate();
            } catch (error) {
                setIsAssistantOnline(false);
                setIsConnecting(false);
                console.error('❌ WebSocket setup failed:', error);
            }
        }

        setupWebSocket();

        return () => {
            if (client?.active) {
                console.log('🧹 Disconnecting existing WebSocket client...');
                setIsAssistantOnline(false);
                client.deactivate();
            }
        };
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            try {
                const detail = (e as CustomEvent).detail;
                if (!detail) return;
                const {imageUrl, qrUrl, label} = detail as { imageUrl: string; qrUrl: string; label?: string };

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

            const mergedArgs = {...globalArgs, ...(customArgs || {})};

            const body = {
                messages: messageSnapshot.map((m) => ({role: m.role, content: m.content})),
                arguments: mergedArgs,
            };

            const res = await fetch('/api/mcp/send', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            });

            const data = await res.json();
            setIsTyping(false);

            if (data.pendingRequest?.arguments) {
                setGlobalArgs((prev) => ({
                    ...prev,
                    ...data.pendingRequest.arguments,
                }));
                setPendingArgs(data.pendingRequest.arguments);
            }
            console.log("MCP RESPONSE DATA:", data);

            if (customArgs) {
                setGlobalArgs((prev) => ({
                    ...prev,
                    ...customArgs,
                }));
            }

            if (data.pendingRequest?.function) {
                setActiveIntent(data.pendingRequest.function);
            }

            if (data.pendingRequest?.function) {
                setMessageType(data.pendingRequest.function);
                setPendingRequestOptions(data.pendingRequest.options);
            }

            if (typeof data.message?.content === 'string' && data.message.content.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(data.message.content);
                    if (parsed.function && parsed.arguments) {
                        console.warn("🔍 Function call message (not showing to user):", parsed);
                        return;
                    }
                } catch (error) {
                    console.warn("⚠️ Failed to parse function call message:", error)
                }
            }

            if (data.message) {
                const msg: Message = data.message;
                setMessages((prev) => [...prev, {...msg, id: crypto.randomUUID(), role: msg.role || 'assistant'}]);
            } else if (Array.isArray(data.messages)) {
                setMessages((prev) => [
                    ...prev,
                    ...data.messages.map((m: any) => ({
                        ...m,
                        id: crypto.randomUUID(),
                        role: m.role || 'assistant',
                    })),
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        type: 'text',
                        content: 'İşlem başarıyla gönderildi, sonuç kısa süre içinde gelecektir.',
                    },
                ]);
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
                m.data?.accounts?.some((a: any) => a.id === selection)
        );
        const selected = allAccountsMsg?.data?.accounts?.find((a: any) => a.id === selection);

        console.log("selected: ", selected);
        if (selected) {
            setSelectedAccount({id: selected.id, name: selected.name, iban: selected.iban});
            return;
        }

        // ✅ 2. Eğer kayıtlı alıcı seçtiyse
        type SavedAccount = { accountIBAN: string; id?: string; firstName?: string; lastName?: string };

        const savedMsg = messages.find((m) => {
            const t = String((m as Message).type);
            return t === 'get_saved_accounts' || t === 'get_saved_accounts_for_transfer';
        }) as (Message & { data?: { savedAccounts?: SavedAccount[] } }) | undefined;

        const selectedRecipientData = savedMsg?.data?.savedAccounts?.find(
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

            setMessages((prev) => [...prev, newMsg]);
            sendRestMessage([...messages, newMsg], {confirm: isConfirm});
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
        if (normalizedPrefix) {
            const startsWithPrefix = normalizedRaw.startsWith(normalizedPrefix + ' ');
            if (!startsWithPrefix) {
                finalContent = `${normalizedPrefix} ${normalizedRaw}`;
            }
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
            <div className="fixed bottom-6 right-6 z-50">
                <PopUpMap></PopUpMap>
                <div className="relative">
                    {/* Animated glow ring */}
                    <div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-75 blur-xl animate-pulse"></div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
                    >
                        {isOpen ? (
                            <X className="w-7 h-7 transition-transform group-hover:rotate-90 duration-300"/>
                        ) : (
                            <MessageCircle className="w-7 h-7"/>
                        )}
                    </button>
                </div>
            </div>

            {/* Chat Window with Glass Effect */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 w-[450px] h-[650px] z-50 flex flex-col overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl bg-white/95 border border-purple-100">
                    {/* Modern Header with Gradient Mesh */}
                    <div
                        className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white p-6 overflow-hidden">
                        {/* Animated background elements */}
                        <div
                            className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                        <div
                            className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl"></div>

                        <div className="relative flex items-center gap-4">
                            <div className="relative">
                                <div
                                    className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300">
                                    💬
                                </div>
                                <div
                                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-purple-600 animate-pulse"></div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold">BAKIRBANK Asistan</h3>
                                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse"/>
                                </div>
                                <p className={`text-sm flex items-center gap-2 ${
                                    isAssistantOnline ? 'text-purple-100' : 'text-gray-400'
                                }`}>
  <span className={`w-2 h-2 rounded-full ${
      isAssistantOnline
          ? 'bg-green-400 animate-pulse'
          : isConnecting
              ? 'bg-yellow-400 animate-pulse'
              : 'bg-gray-400'
  }`}></span>
                                    {isConnecting
                                        ? 'Bağlanıyor...'
                                        : isAssistantOnline
                                            ? 'Çevrimiçi'
                                            : 'Çevrimdışı'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area with Modern Styling.*/}
                    <div
                        className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 via-purple-50/30 to-indigo-50/30">
                        {messages.map((msg, idx) => (
                            <div
                                key={msg.id}
                                className={`flex mb-4 animate-[slideIn_0.3s_ease-out] ${
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                                style={{animationDelay: `${idx * 0.05}s`}}
                            >
                                <div
                                    className={`max-w-[90%] px-5 py-3.5 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-purple-200 rounded-br-md'
                                            : 'bg-white/90 text-gray-800 rounded-bl-md border border-purple-100'
                                    }`}
                                >
                                    <MessageRenderer
                                        message={msg}
                                        pendingRequestOptions={pendingRequestOptions}
                                        messageType={messageType}
                                        globalArgs={globalArgs}
                                        onAccountSelect={handleAccountSelect}
                                    />
                                    {msg.timestamp && (
                                        <span className={`text-xs mt-2 block ${
                                            msg.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                                        }`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Modern Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start mb-4">
                                <div
                                    className="bg-white/90 backdrop-blur-sm px-5 py-4 rounded-2xl shadow-lg border border-purple-100">
                                    <div className="flex gap-1.5">
                                        <span
                                            className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce"
                                            style={{animationDelay: '0ms'}}></span>
                                        <span
                                            className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce"
                                            style={{animationDelay: '150ms'}}></span>
                                        <span
                                            className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce"
                                            style={{animationDelay: '300ms'}}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef}/>
                    </div>

                    {/* Modern Input Area with Glass Effect */}
                    <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-purple-100/50">
                        <div className="flex gap-3 items-center">
                            <div
                                className={`flex items-center flex-1 px-4 py-3 rounded-2xl border-2 transition-all duration-300 ${
                                    isAssistantOnline
                                        ? 'border-purple-200/50 focus-within:border-purple-500 bg-white/60 backdrop-blur-sm'
                                        : 'border-gray-300 bg-gray-100/60 backdrop-blur-sm opacity-75'
                                }`}
                            >
                                {(selectedAccountChip || selectedAccount || selectedRecipient) && (
                                    <div className="flex items-center gap-2">
                                        {(selectedAccountChip || selectedAccount) && (
                                            <SelectedAccountChip
                                                accounts={selectedAccountChip ? selectedAccountChip : [selectedAccount!]}
                                                onRemove={(id?: string) => {
                                                    if (selectedAccountChip) {
                                                        setSelectedAccountChip((prev) => {
                                                            const next = prev ? prev.filter((a) => a.id !== id) : [];
                                                            return next.length ? next : null;
                                                        });
                                                    } else {
                                                        setSelectedAccount(null);
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={!isAssistantOnline}
                                    placeholder={
                                        !isAssistantOnline
                                            ? 'Asistan şu anda çevrimdışı...'
                                            : selectedAccount
                                                ? 'Seçilen hesapla ilgili işleminizi yazın...'
                                                : 'Mesajınızı yazın...'
                                    }
                                    className={`flex-1 bg-transparent outline-none ml-2 text-gray-800 placeholder:text-gray-400 ${
                                        !isAssistantOnline ? 'opacity-60 cursor-not-allowed' : ''
                                    }`}
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || !isAssistantOnline}
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <Send className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}