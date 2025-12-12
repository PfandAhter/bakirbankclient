import { useState, useEffect } from 'react';
import { Transaction } from '@/src/types/transaction';

interface UseTransactionsProps {
    selectedAccountId?: string;
    showAlert: (type: any, title: string, message: string) => void;
}

export const useTransactions = ({ selectedAccountId, showAlert }: UseTransactionsProps) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [filterDate, setFilterDate] = useState<'ALL' | 'WEEK' | 'MONTH'>('ALL');

    const fetchTransactions = async () => {
        if (!selectedAccountId) return;
        try {
            const response = await fetch('/api/account/transaction/list', {
                method: 'POST',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page,
                    size: 5,
                    accountId: selectedAccountId,
                    type: filterType !== 'ALL' ? filterType : undefined,
                    dateRange: filterDate !== 'ALL' ? filterDate : undefined,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                showAlert("error", data.processCode || "Hata", data.processMessage || "Hata oluştu");
                return;
            }

            setTransactions(data.transactions || data);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error("Transactions fetch error:", err);
            showAlert("error", "Sunucu Hatası", "Lütfen tekrar deneyiniz.");
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [selectedAccountId, page, filterType, filterDate]);

    return {
        transactions,
        setTransactions,
        fetchTransactions,
        page,
        setPage,
        totalPages,
        filterType,
        setFilterType,
        filterDate,
        setFilterDate
    };
};