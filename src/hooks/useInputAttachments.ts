// src/hooks/useInputAttachments.ts
'use client';

import { useState, useCallback } from 'react';
import { InputAttachment } from '@/src/types/chat';

interface UseInputAttachmentsReturn {
    attachments: InputAttachment[];
    addAttachment: (attachment: InputAttachment) => void;
    removeAttachment: (id: string) => void;
    clearAttachments: () => void;
    hasAttachments: boolean;
}

export function useInputAttachments(): UseInputAttachmentsReturn {
    const [attachments, setAttachments] = useState<InputAttachment[]>([]);

    const addAttachment = useCallback((attachment: InputAttachment) => {
        setAttachments(prev => {
            // Generate unique key based on type and account identifier
            const getAttachmentKey = (att: InputAttachment) => {
                // For account/saved_account types, use the account id or iban as unique key
                if (att.type === 'account' || att.type === 'saved_account') {
                    const id = att.data?.id || att.data?.iban || att.data?.accountIBAN || att.id;
                    return `${att.type}-${id}`;
                }
                // For other types (bank, location, recipient), prevent duplicate types
                return att.type;
            };

            const newKey = getAttachmentKey(attachment);
            // Filter out any attachment with the same unique key
            const filtered = prev.filter(a => getAttachmentKey(a) !== newKey);
            return [...filtered, attachment];
        });
    }, []);

    const removeAttachment = useCallback((id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    }, []);

    const clearAttachments = useCallback(() => {
        setAttachments([]);
    }, []);

    return {
        attachments,
        addAttachment,
        removeAttachment,
        clearAttachments,
        hasAttachments: attachments.length > 0
    };
}
