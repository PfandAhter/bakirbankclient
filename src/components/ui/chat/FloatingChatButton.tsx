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
            className="relative w-[60px] h-[60px] rounded-full border-none bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 text-white cursor-pointer flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.4),0_4px_16px_rgba(0,0,0,0.2)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(99,102,241,0.5),0_6px_20px_rgba(0,0,0,0.3)]"
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
            {/* Pulse ring effect when not open */}
            {!isOpen && hasUnreadMessages && (
                <motion.span
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 -z-10"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
            )}

            {/* Icon transition */}
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.span
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
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
                        className="flex items-center justify-center"
                    >
                        <MessageCircle size={24} />
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Notification badge */}
            {hasUnreadMessages && !isOpen && (
                <motion.span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-[3px] border-slate-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                />
            )}
        </motion.button>
    );
};
