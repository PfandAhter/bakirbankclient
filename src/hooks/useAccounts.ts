import { useState, useEffect, useCallback } from 'react';
import { Account, NewAccountFormState, AccountListResponse } from '@/src/types/account';
import { useNotify } from '@/src/hooks/notification/useNotify';
import { BaseResponse } from '@/src/types/response';


export const useAccounts = (isAuthenticated: boolean) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account>();
    const [isLoading, setIsLoading] = useState(false);
    const notify = useNotify();

    const fetchAccountData = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/account/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data: AccountListResponse = await res.json();

            if (res.ok) {
                if (data.accounts && Array.isArray(data.accounts)) {
                    setAccounts(data.accounts);
                    if (data.accounts.length > 0) {
                        setSelectedAccount(prev => prev || data.accounts![0]);
                    }
                } else {
                    setAccounts([]);
                }
            } else {
                notify.error('Hata', data.processMessage || 'Hesaplar alınamadı.');
            }
        } catch (err) {
            console.error("Account fetch error:", err);
            notify.error('Bağlantı Hatası', 'Hesap bilgileri yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const createAccount = async (newAccount: NewAccountFormState, idempotencyKey: string): Promise<boolean> => {
        try {
            const res = await fetch(`/api/account/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': idempotencyKey
                },
                body: JSON.stringify({
                    name: newAccount.name,
                    description: newAccount.description,
                    currency: newAccount.currency,
                    branchId: newAccount.branchId,
                }),
            });

            const data: BaseResponse = await res.json();

            if (res.ok) {
                notify.success('Başarılı', data.processMessage || 'Hesap başarıyla oluşturuldu.');
                await fetchAccountData();
                return true;
            } else {
                notify.error('Başarısız', data.processMessage || 'Hesap oluşturulamadı.');
                return false;
            }
        } catch (err) {
            console.error(err);
            notify.error('Hata', 'İşlem sırasında bir hata oluştu.');
            return false;
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAccountData();
        }
    }, [isAuthenticated, fetchAccountData]);

    return {
        accounts,
        selectedAccount,
        setSelectedAccount,
        isLoading,
        fetchAccountData,
        createAccount,
        setAccounts
    };
};