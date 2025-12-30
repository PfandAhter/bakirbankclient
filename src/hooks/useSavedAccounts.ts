import { useState, useEffect, useCallback, useRef } from 'react';
import { SavedRecipient, SavedAccountListResponse } from '@/src/types/account';
import { useNotify } from '@/src/hooks/notification/useNotify';

export function useSavedAccounts(isAuthenticated: boolean = true) {
    const [savedAccounts, setSavedAccounts] = useState<SavedRecipient[]>([]);
    const [loading, setLoading] = useState(false);
    const notify = useNotify();
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchSavedAccounts = useCallback(async () => {
        if (!isAuthenticated) return;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setLoading(true);
        try {
            const res = await fetch('/api/account/saved/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });

            const data: SavedAccountListResponse = await res.json();

            if (res.ok) {
                if (data.savedAccounts && Array.isArray(data.savedAccounts)) {
                    setSavedAccounts(data.savedAccounts);
                } else {
                    setSavedAccounts([]);
                }
            } else {
                if (data.processMessage) {
                    notify.error('Hata', data.processMessage);
                }
                setSavedAccounts([]);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error('Failed to fetch saved accounts', error);
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchSavedAccounts();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchSavedAccounts]);
    return {
        savedAccounts,
        loading,
        refresh: fetchSavedAccounts
    };
}