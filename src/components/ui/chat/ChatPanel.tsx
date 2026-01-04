'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Bot, Sparkles, Shield } from 'lucide-react';
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
            className="absolute bottom-20 right-0 w-[400px] h-[600px] max-h-[calc(100vh-120px)] rounded-[20px] overflow-hidden flex flex-col bg-[#0a0b0f]/98 backdrop-blur-xl border border-[#740001]/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(116,0,1,0.2),0_0_40px_rgba(116,0,1,0.1)]"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            {/* Header - Gryffindor Theme */}
            <header className="px-5 py-4 flex items-center justify-between bg-gradient-to-b from-[#740001]/20 to-transparent border-b border-[#D3A625]/20">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#740001] to-[#5C0001] flex items-center justify-center text-[#D3A625] border border-[#D3A625]/30 shadow-[0_0_15px_rgba(116,0,1,0.3)]">
                        <Bot size={20} />
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#D3A625]/10 to-transparent pointer-events-none" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-base font-semibold text-slate-50 flex items-center gap-1.5 m-0">
                            BAKIRBANK Asistanı
                            <Sparkles size={14} className="text-[#D3A625]" />
                        </h2>
                        <div className="text-xs">
                            {isLoading ? (
                                <span className="text-[#D3A625] flex items-center gap-1.5">
                                    <span className="flex gap-0.5">
                                        <span className="w-1.5 h-1.5 bg-[#D3A625] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-[#D3A625] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-[#D3A625] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </span>
                                    İşleniyor...
                                </span>
                            ) : (
                                <span className="text-[#D3A625] flex items-center gap-1">
                                    <span className="w-2 h-2 bg-[#D3A625] rounded-full animate-pulse" />
                                    Çevrimiçi
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    className="w-8 h-8 rounded-lg border border-[#D3A625]/20 bg-[#740001]/30 text-[#D3A625]/70 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[#740001]/50 hover:text-[#D3A625] hover:border-[#D3A625]/40"
                    onClick={onClose}
                    aria-label="Close chat"
                >
                    <X size={18} />
                </button>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-transparent to-[#740001]/5">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
                        <div className="relative w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#740001]/30 to-[#5C0001]/30 flex items-center justify-center mb-5 text-[#D3A625] border border-[#D3A625]/20">
                            <Shield size={40} />
                            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-[#D3A625]/5 to-transparent pointer-events-none" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-50 m-0 mb-2">
                            Merhaba! <span className="text-[#D3A625]">👋</span>
                        </h3>
                        <p className="text-sm leading-relaxed m-0 max-w-[280px] text-gray-400">
                            Size nasıl yardımcı olabilirim? <span className="text-[#D3A625]">Hesap bilgileri</span>, işlem geçmişi veya <span className="text-[#D3A625]">para transferi</span> için bana yazabilirsiniz.
                        </p>
                        {/* Decorative line */}
                        <div className="mt-6 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D3A625]/50 to-transparent rounded-full" />
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
