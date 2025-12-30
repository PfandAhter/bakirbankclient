import {useState, useEffect, useCallback} from 'react';
import {Transaction} from '@/src/types/transaction';

interface UseTransactionsProps {
    selectedAccountId?: string;
    showAlert: (type: any, title: string, message: string) => void;
}

interface AtmTransferParams {
    atmId: string;
    senderIban: string;
    senderFirstName: string;
    senderSecondName?: string;
    senderLastName: string;
    receiverTckn?: string;
    receiverIban?: string;
    receiverFirstName?: string;
    receiverSecondName?: string;
    receiverLastName?: string;
    amount: string;
    description: string;
}

interface RecipientInfo {
    firstName: string;
    secondName?: string;
    lastName: string;
    fullName: string;
}

export const useTransactions = ({selectedAccountId, showAlert}: UseTransactionsProps) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [filterDate, setFilterDate] = useState<'ALL' | 'WEEK' | 'MONTH'>('ALL');
    const [isTransferLoading, setIsTransferLoading] = useState(false);
    const [isIbanLoading, setIsIbanLoading] = useState(false);

    const fetchTransactions = async () => {
        if (!selectedAccountId) return;
        try {
            const response = await fetch('/api/account/transaction/list', {
                method: 'POST',
                credentials: "include",
                headers: {'Content-Type': 'application/json'},
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

    const atmTransfer = async (params: AtmTransferParams): Promise<boolean> => {
        setIsTransferLoading(true);
        try {
            const response = await fetch('/api/transaction/transfer/atm', {
                method: 'POST',
                credentials: "include",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(params),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert("success", "Başarılı", data.processMessage || "Transfer başarılı.");
                await fetchTransactions();
                return true;
            } else {
                showAlert("error", data.processCode || "Hata", data.processMessage || "Transfer başarısız.");
                return false;
            }
        } catch (err) {
            console.error("ATM Transfer error:", err);
            showAlert("error", "Sunucu Hatası", "Transfer işlemi sırasında bir hata oluştu.");
            return false;
        } finally {
            setIsTransferLoading(false);
        }
    };

    const getUserByIban = async (iban: string): Promise<{
        firstName: string;
        secondName?: string;
        lastName: string
    } | null> => {
        try {
            const response = await fetch(`/api/account/get/user/by-iban?iban=${iban}`, {
                method: 'GET',
                credentials: "include",
            });

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (err) {
            console.error("IBAN ile kullanıcı bulunamadı:", err);
            return null;
        }
    };

    const fetchRecipientByIban = useCallback(async (
        iban: string,
        options?: { silent?: boolean }
    ): Promise<RecipientInfo | null> => {
        const cleanIban = iban.replace(/\s/g, "");

        if (cleanIban.length < 26) {
            return null;
        }

        setIsIbanLoading(true);
        try {
            const response = await fetch(`/api/account/get-name-by-iban?iban=${encodeURIComponent(cleanIban)}`, {
                method: 'GET',
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok && data.firstName) {
                const fullName = [data.firstName, data.secondName, data.lastName]
                    .filter(Boolean)
                    .join(" ");

                if (!options?.silent) {
                    showAlert("info", "Alıcı Bulundu", "IBAN sahibinin adı getirildi.");
                }

                return {
                    firstName: data.firstName,
                    secondName: data.secondName,
                    lastName: data.lastName,
                    fullName
                };
            } else {
                if (!options?.silent) {
                    showAlert("warning", "Uyarı", "Kullanıcı bulunamadı.");
                }
                return null;
            }
        } catch (err) {
            console.error("IBAN ile kullanıcı sorgulanamadı:", err);
            if (!options?.silent) {
                showAlert("error", "Hata", "Sorgulama başarısız.");
            }
            return null;
        } finally {
            setIsIbanLoading(false);
        }
    }, [showAlert]);

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
        setFilterDate,
        atmTransfer,
        getUserByIban,
        fetchRecipientByIban,
        isTransferLoading,
        isIbanLoading
    };
};