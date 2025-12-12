// src/components/chat/MessageList.tsx
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/src/types/chat';
import { AccountSelector } from './renderers/AccountSelector';
import { TransactionList } from './renderers/TransactionList';
import { TransferConfirmation } from './renderers/TransferConfirmation';
import { BankNameList } from './renderers/BankNameList';
import { Bot, User } from 'lucide-react';
import Markdown from 'markdown-to-jsx';

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
        // If it's a specific widget type, render that
        switch (msg.type) {
            case 'account_selection': // for get_user_accounts or get_saved_accounts
                if (msg.data && msg.data.accounts) {
                    return (
                        <div className="w-full mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                            <AccountSelector
                                accounts={msg.data.accounts}
                                onSelect={(acc) => onWidgetAction('account_selected', acc)}
                            />
                        </div>
                    );
                }
                break;
            case 'bank_name_list':
                if (msg.data && msg.data.banks) {
                    return (
                        <BankNameList
                            banks={msg.data.banks}
                            onSelect={(bankName) => onWidgetAction('bank_selected', bankName)}
                        />
                    );
                }
                break;
            case 'transaction_list':
                if (msg.data && msg.data.transactions) {
                    return (
                        <div className="w-full mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                            <TransactionList transactions={msg.data.transactions} />
                        </div>
                    );
                }
                break;
            case 'transfer_confirmation':
                if (msg.data) {
                    return (
                        <TransferConfirmation
                            preview={msg.data}
                            onConfirm={() => onWidgetAction('transfer_confirmed', msg.data)}
                            onReject={() => onWidgetAction('transfer_rejected', msg.data)}
                        />
                    );
                }
                break;
            default:
                break;
        }

        // Default: Render markdown text
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
