import {useState, useEffect, useCallback, useRef} from 'react';
import { Card, CardListResponse, CreateCardRequest } from '@/src/types/card';
import { useNotify } from '@/src/hooks/notification/useNotify';
import {BaseResponse} from "@/src/types/response";

export function useCards(selectedAccountId: string | null = null) {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(false);
    const notify = useNotify();
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchCards = useCallback(async () => {
        if (!selectedAccountId) {
            setCards([]);
            setLoading(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            const res = await fetch('/api/cards/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: selectedAccountId }),
                signal: controller.signal
            });
            const data: CardListResponse = await res.json();

            if (res.ok) {
                if (data.carts && Array.isArray(data.carts)) {
                    setCards(data.carts);
                } else {
                    setCards([]);
                }
            } else {
                if(data.processMessage) {
                    notify.error('Hata', data.processMessage);
                }
                setCards([]);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;

            console.error('Failed to fetch cards', error);
            notify.error('Bağlantı Hatası', 'Sunucuya erişilemiyor.');
            setCards([]);
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccountId]);

    useEffect(() => {
        fetchCards();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchCards]);

    const createCard = async (request: CreateCardRequest): Promise<boolean> => {
        try {
            const res = await fetch('/api/cards/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });

            const data: BaseResponse = await res.json();
            if (res.ok) {
                notify.success('İşlem Başarılı', data.processMessage || 'Yeni kartınız başarıyla oluşturuldu.');
                await fetchCards();
                return true;
            } else {
                notify.error('Kart Oluşturulamadı', data.processMessage || 'Beklenmedik bir hata oluştu.');
                return false;
            }
        } catch (e) {
            console.error(e);
            notify.error('Bağlantı Hatası', 'Sunucu ile iletişim kurulamadı.');
            return false;
        }
    };

    const toggleCardBlock = async (cardId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
            const queryParams = new URLSearchParams({
                cardId: cardId,
                status: newStatus
            });

            const res = await fetch(`/api/cards/block?${queryParams.toString()}`, {
                method: 'POST',
            });

            const data: BaseResponse = await res.json();
            if (res.ok) {
                notify.success('Durum Güncellendi', data.processMessage || 'Kart statüsü değiştirildi.');
                await fetchCards();
            } else {
                notify.error('Güncelleme Başarısız', data.processMessage || 'Kart durumu değiştirilemedi.');
            }
        } catch (error) {
            console.error('Card status update error:', error);
            notify.error('Hata', 'İşlem sırasında bir hata oluştu.');
        }
    };

    return { cards, loading, createCard, toggleCardBlock, refresh: fetchCards };
}