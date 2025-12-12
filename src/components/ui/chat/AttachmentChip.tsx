'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {X, CreditCard, User, Wallet, Building2, MapPin} from 'lucide-react';
import { InputAttachment } from '@/src/types/chat';

interface AttachmentChipProps {
    attachment: InputAttachment;
    onRemove: (id: string) => void;
}

const getChipIcon = (type: InputAttachment['type']) => {
    switch (type) {
        case 'account':
            return <Wallet size={14} />;
        case 'saved_account':
            return <CreditCard size={14} />;
        case 'recipient':
            return <User size={14} />;
        case 'bank':
            return <Building2 size={14} />;
        case 'location':
            return <MapPin size={14} />;
        default:
            return <CreditCard size={14} />;
    }
};

export const AttachmentChip: React.FC<AttachmentChipProps> = ({ attachment, onRemove }) => {
    return (
        <motion.div
            className="inline-flex items-center gap-1.5 py-1.5 px-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full text-[0.8125rem] text-slate-50 cursor-default"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
            layout
        >
            <span className="flex items-center text-purple-500">
                {getChipIcon(attachment.type)}
            </span>
            <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                {attachment.label}
            </span>
            <button
                className="flex items-center justify-center w-[18px] h-[18px] border-none bg-white/10 rounded-full text-white/60 cursor-pointer transition-all duration-200 p-0 ml-0.5 hover:bg-red-500/30 hover:text-red-500"
                onClick={() => onRemove(attachment.id)}
                aria-label={`Remove ${attachment.label}`}
            >
                <X size={12} />
            </button>
        </motion.div>
    );
};
