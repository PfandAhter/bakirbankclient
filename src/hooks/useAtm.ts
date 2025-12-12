// src/hooks/useATM.ts
import { useState, useEffect, useCallback } from 'react';
import { Atm } from '@/src/types/atm-map'; // Tip dosyanın yeri

export const useATM = () => {
    const [atms, setAtms] = useState<Atm[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refreshAtms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/atm/list?id=all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'ATM verisi alınamadı.');
            }

            const data = await response.json();
            console.log('[useATM] Raw API response:', data);

            // Backend returns GetAllATMResponse: { atmStatusDTOList: [...] }
            const atmList = data.atmStatusDTOList || data || [];

            const mappedAtms: Atm[] = Array.isArray(atmList) ? atmList.map((item: any) => ({
                id: item.id,
                name: item.name,
                latitude: parseFloat(item.latitude),
                longitude: parseFloat(item.longitude),
                address: item.address,
                status: item.status,
                depositStatus: item.depositStatus,
                withdrawStatus: item.withdrawStatus,
                supportedBanks: item.supportedBanks,
                isUserCreated: item.isUserCreated || false
            })) : [];

            console.log('[useATM] Mapped ATMs count:', mappedAtms.length);
            setAtms(mappedAtms);

        } catch (err: any) {
            console.error("Hook Error:", err);
            setError(err.message || "Beklenmeyen bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAtms();
    }, [refreshAtms]);

    return {
        atms,
        loading,
        error,
        refetch: refreshAtms
    };
};