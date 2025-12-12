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
            // Prevent duplicate attachments of the same type
            const filtered = prev.filter(a => a.type !== attachment.type);
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
