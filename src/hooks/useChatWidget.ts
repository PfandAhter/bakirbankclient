// src/hooks/useChatWidget.ts
'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseChatWidgetOptions {
    defaultOpen?: boolean;
    closeOnEscape?: boolean;
}

interface UseChatWidgetReturn {
    isOpen: boolean;
    isAnimating: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
}

export function useChatWidget(options: UseChatWidgetOptions = {}): UseChatWidgetReturn {
    const {
        defaultOpen = false,
        closeOnEscape = true
    } = options;

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isAnimating, setIsAnimating] = useState(false);

    const open = useCallback(() => {
        if (!isOpen) {
            setIsAnimating(true);
            setIsOpen(true);
            // Animation complete after transition
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [isOpen]);

    const close = useCallback(() => {
        if (isOpen) {
            setIsAnimating(true);
            setIsOpen(false);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [isOpen]);

    const toggle = useCallback(() => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }, [isOpen, close, open]);

    // Handle keyboard shortcuts
    useEffect(() => {
        if (!closeOnEscape) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                close();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeOnEscape, isOpen, close]);

    return {
        isOpen,
        isAnimating,
        toggle,
        open,
        close
    };
}
