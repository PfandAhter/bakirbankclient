import { useState, useEffect } from 'react';
import { SessionLog } from '@/src/types/profile';

export const useSessionHistory = (activeTab: string, userId?: string) => {
    const [history, setHistory] = useState<SessionLog[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (activeTab !== "sessions" || !userId) return;

            try {
                const response = await fetch('/api/account/user/get/session-history', {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!response.ok) throw new Error("Session fetch failed");
                const res = await response.json();
                setHistory(res);
            } catch (err) {
                console.error("Oturum geçmişi hatası:", err);
            }
        };

        fetchHistory();
    }, [activeTab, userId]);

    return { history };
};