import { useState, useEffect } from 'react';
import { Account, NewAccountFormState } from '@/src/types/account';

export const useAccounts = (isAuthenticated: boolean) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account>();
    const [isLoading, setIsLoading] = useState(true);

    const fetchAccountData = async () => {
        try {
            const res = await fetch('/api/account/list', {
                method: 'POST',
                credentials: "include"
            });

            if (!res.ok) throw new Error("API Error");

            const data = await res.json();
            setAccounts(data);

            if (data.length > 0 && !selectedAccount) {
                setSelectedAccount(data[0]);
            }
        } catch (err) {
            console.error("Account fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const createAccount = async (newAccount: NewAccountFormState) => {
        await fetch(`/api/account/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify({
                name: newAccount.name,
                description: newAccount.description,
                currency: newAccount.currency,
                branchId: newAccount.branchId,
            }),
        });
        await fetchAccountData();
    };

    useEffect(() => {
        if (isAuthenticated) fetchAccountData();
    }, [isAuthenticated]);

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