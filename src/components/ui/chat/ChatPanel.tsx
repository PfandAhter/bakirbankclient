'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Bot, Sparkles } from 'lucide-react';
import { ChatMessage, InputAttachment } from '@/src/types/chat';
import { MessageList } from '@/src/components/ui/chat/MessageList';
import { InputArea } from '@/src/components/ui/chat/InputArea';

interface ChatPanelProps {
    isOpen: boolean;
    messages: ChatMessage[];
    isLoading: boolean;
    attachments: InputAttachment[];
    onAddAttachment: (attachment: InputAttachment) => void;
    onRemoveAttachment: (id: string) => void;
    onSendMessage: (text: string, attachments: InputAttachment[]) => void;
    onWidgetAction: (action: string, payload: any) => void;
    onClose: () => void;
}

const panelVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 1, 1] as const
        }
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0, 0, 0.2, 1] as const
        }
    }
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
                                                        isOpen,
                                                        messages,
                                                        isLoading,
                                                        attachments,
                                                        onAddAttachment,
                                                        onRemoveAttachment,
                                                        onSendMessage,
                                                        onWidgetAction,
                                                        onClose
                                                    }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            className="absolute bottom-20 right-0 w-[400px] h-[600px] max-h-[calc(100vh-120px)] rounded-[20px] overflow-hidden flex flex-col bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            {/* Header */}
            <header className="px-5 py-4 flex items-center justify-between bg-gradient-to-b from-white/[0.08] to-transparent border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white">
                        <Bot size={20} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-base font-semibold text-slate-50 flex items-center gap-1.5 m-0">
                            AI Personal Banker
                            <Sparkles size={14} className="text-amber-400" />
                        </h2>
                        <div className="text-xs">
                            {isLoading ? (
                                <span className="text-indigo-400 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-current rounded-full animate-typing" />
                                    <span className="w-1 h-1 bg-current rounded-full animate-typing animate-typing-delay-1" />
                                    <span className="w-1 h-1 bg-current rounded-full animate-typing animate-typing-delay-2" />
                                    Processing...
                                </span>
                            ) : (
                                <span className="text-emerald-500">● Online</span>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    className="w-8 h-8 rounded-lg border-none bg-white/10 text-white/70 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/15 hover:text-white"
                    onClick={onClose}
                    aria-label="Close chat"
                >
                    <X size={18} />
                </button>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center text-white/70">
                        <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-5 text-purple-500">
                            <Bot size={48} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-50 m-0 mb-2">Merhaba! 👋</h3>
                        <p className="text-sm leading-relaxed m-0 max-w-[280px]">
                            Size nasıl yardımcı olabilirim? Hesap bilgileri, işlem geçmişi veya para transferi için bana yazabilirsiniz.
                        </p>
                    </div>
                ) : (
                    <MessageList
                        messages={messages}
                        onWidgetAction={onWidgetAction}
                    />
                )}
            </div>

            {/* Input */}
            <InputArea
                attachments={attachments}
                onAddAttachment={onAddAttachment}
                onRemoveAttachment={onRemoveAttachment}
                onSendMessage={onSendMessage}
                disabled={isLoading}
            />
        </motion.div>
    );
};
