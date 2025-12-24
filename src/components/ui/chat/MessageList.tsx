// src/components/chat/MessageList.tsx
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/src/types/chat';
import { AccountSelector } from './renderers/AccountSelector';
import { TransactionList } from './renderers/TransactionList';
import { TransferConfirmation } from './renderers/TransferConfirmation';
import { BankNameList } from './renderers/BankNameList';
import { Bot, User } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { QRCodeCanvas } from 'qrcode.react';

interface MessageListProps {
    messages: ChatMessage[];
    onWidgetAction: (action: string, payload: any) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onWidgetAction }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const renderContent = (msg: ChatMessage) => {
        // Render widget based on type
        const renderWidget = () => {
            switch (msg.type) {
                case 'account_selection':
                    if (msg.data && msg.data.accounts) {
                        return (
                            <div className="w-full mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                                <AccountSelector
                                    accounts={msg.data.accounts}
                                    onSelect={(acc) => onWidgetAction('account_selected', acc)}
                                />
                            </div>
                        );
                    }
                    return null;

                case 'bank_name_list':
                    if (msg.data && msg.data.banks) {
                        return (
                            <div className="mt-3">
                                <BankNameList
                                    banks={msg.data.banks}
                                    onSelect={(bankName) => onWidgetAction('bank_selected', bankName)}
                                />
                            </div>
                        );
                    }
                    return null;

                case 'transaction_list':
                    if (msg.data && msg.data.transactions) {
                        return (
                            <div className="w-full mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                                <TransactionList transactions={msg.data.transactions} />
                            </div>
                        );
                    }
                    return null;

                case 'transfer_confirmation':
                    if (msg.data) {
                        return (
                            <div className="mt-3">
                                <TransferConfirmation
                                    preview={msg.data}
                                    onConfirm={() => onWidgetAction('transfer_confirmed', msg.data)}
                                    onReject={() => onWidgetAction('transfer_rejected', msg.data)}
                                />
                            </div>
                        );
                    }
                    return null;

                case 'qr_code':
                    if (msg.data?.qrUrl) {
                        return (
                            <div className="flex flex-col items-center p-4 mt-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border border-white/10">
                                <a
                                    href={msg.data.qrUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white rounded-lg hover:scale-105 transition-transform duration-200"
                                >
                                    <QRCodeCanvas value={msg.data.qrUrl} size={140} />
                                </a>
                                <p className="mt-3 text-sm text-white font-medium">{msg.data.label || 'QR Kodu'}</p>
                                <a
                                    href={msg.data.qrUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                                >
                                    📷 Haritayı Görüntüle
                                </a>
                            </div>
                        );
                    }
                    return null;

                default:
                    return null;
            }
        };

        const widget = renderWidget();

        // If widget exists, show ONLY the widget (no text with raw data)
        // If no widget, show text content
        if (widget) {
            return widget;
        }

        return (
            <div className="markdown-content">
                <Markdown>{msg.content}</Markdown>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scroll-smooth" ref={scrollRef}>
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 text-white ${msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-emerald-500 to-blue-500'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                        }`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div className={`py-3 px-4 rounded-2xl max-w-[80%] leading-relaxed text-[0.9375rem] ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-br-sm'
                        : 'bg-white/10 text-slate-50 rounded-bl-sm border border-white/5'
                        }`}>
                        {renderContent(msg)}
                    </div>
                </div>
            ))}
        </div>
    );
};
