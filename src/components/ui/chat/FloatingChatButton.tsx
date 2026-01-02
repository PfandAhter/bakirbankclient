'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

interface FloatingChatButtonProps {
    isOpen: boolean;
    onClick: () => void;
    hasUnreadMessages?: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
    isOpen,
    onClick,
    hasUnreadMessages = false
}) => {
    return (
        <motion.button
            className="relative w-[60px] h-[60px] rounded-full border-2 border-[#D3A625]/30 bg-gradient-to-br from-[#740001] via-[#8B1A1A] to-[#5C0001] text-white cursor-pointer flex items-center justify-center shadow-[0_8px_32px_rgba(116,0,1,0.4),0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(116,0,1,0.5),0_6px_20px_rgba(211,166,37,0.2)] hover:border-[#D3A625]/50"
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
            {/* Pulse ring effect when not open - Gryffindor theme */}
            {!isOpen && hasUnreadMessages && (
                <motion.span
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#740001] to-[#D3A625] -z-10"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
            )}

            {/* Subtle gold ring glow */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D3A625]/10 to-transparent pointer-events-none" />

            {/* Icon transition */}
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.span
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center text-[#D3A625]"
                    >
                        <X size={24} />
                    </motion.span>
                ) : (
                    <motion.span
                        key="chat"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center text-[#D3A625]"
                    >
                        <MessageCircle size={24} />
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Notification badge - Gold accent */}
            {hasUnreadMessages && !isOpen && (
                <motion.span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#D3A625] rounded-full border-[3px] border-[#0a0b0f] shadow-[0_0_8px_rgba(211,166,37,0.5)]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                />
            )}
        </motion.button>
    );
};
