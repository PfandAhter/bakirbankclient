import { useState, useEffect, useCallback } from 'react';
import { Account, AccountListResponse } from '@/src/types/account';
import { Transaction } from '@/src/types/transaction';
import { Card, CardListResponse } from '@/src/types/card';
import { AnalysisReportDTO, AnalyzeRange, AnalysisReportListResponse } from '@/src/types/analysis';
import { useNotify } from '@/src/hooks/notification/useNotify';

/**
 * useDashboard Hook
 * 
 * Dashboard için tüm verileri tek bir hook'tan yönetir.
 * 
 * === API REQUESTS & RESPONSES ===
 * 
 * 1. ACCOUNTS (Hesaplar)
 *    - Endpoint: POST /api/account/list
 *    - Request Body: {} (boş)
 *    - Response: { accounts: Account[], processCode, processMessage }
 * 
 * 2. TRANSACTIONS (İşlemler)
 *    - Endpoint: POST /api/account/transaction/list
 *    - Request Body: { 
 *        accountId: string (veya "ALL" tüm hesaplar için),
 *        page: number,
 *        size: number,
 *        type?: "INCOME" | "EXPENSE",
 *        dateRange?: "WEEK" | "MONTH"
 *      }
 *    - Response: { 
 *        transactions: Transaction[],
 *        totalPages: number,
 *        processCode, processMessage 
 *      }
 * 
 * 3. CARDS (Kartlar)
 *    - Endpoint: POST /api/cards/list
 *    - Request Body: { accountId: string }
 *    - Response: { carts: Card[], processCode, processMessage }
 * 
 * 4. ANALYSIS REPORTS (Analiz Raporları)
 *    - List Endpoint: POST /api/analysis/list
 *    - Request Body: {} (boş)
 *    - Response: { analysisReports: AnalysisReportDTO[] }
 * 
 *    - Create Endpoint: POST /api/analysis/create
 *    - Request Body: { analyzeRange: "LAST_7_DAYS" | "LAST_30_DAYS" }
 *    - Response: { analysisReportId, invoiceRequestId, invoiceStatus, estimatedCompletionDate, invoiceMessage }
 */

interface DashboardStats {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    monthlyIncome: number;
    monthlyExpenses: number;
}

interface UseDashboardProps {
    isAuthenticated: boolean;
}

export const useDashboard = ({ isAuthenticated }: UseDashboardProps) => {
    // States
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [analysisReports, setAnalysisReports] = useState<AnalysisReportDTO[]>([]);

    // Card counts per account: { accountId: cardCount }
    const [cardCountByAccount, setCardCountByAccount] = useState<Record<string, number>>({});
    const [totalCardCount, setTotalCardCount] = useState(0);

    // Loading States
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [isLoadingCards, setIsLoadingCards] = useState(false);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [isCreatingAnalysis, setIsCreatingAnalysis] = useState(false);

    // Dashboard Stats (hesaplanmış değerler)
    const [stats, setStats] = useState<DashboardStats>({
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0
    });

    const notify = useNotify();

    // ==========================================
    // 1. FETCH ACCOUNTS
    // POST /api/account/list
    // Request: {}
    // Response: { accounts: Account[] }
    // ==========================================
    const fetchAccounts = useCallback(async (): Promise<Account[]> => {
        if (!isAuthenticated) return [];

        setIsLoadingAccounts(true);
        try {
            const res = await fetch('/api/account/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data: AccountListResponse = await res.json();

            if (res.ok && data.accounts) {
                setAccounts(data.accounts);

                // Toplam bakiyeyi hesapla
                const totalBalance = data.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
                setStats(prev => ({ ...prev, totalBalance }));

                // İlk hesabı seç
                if (data.accounts.length > 0 && !selectedAccount) {
                    setSelectedAccount(data.accounts[0]);
                }

                return data.accounts;
            } else {
                notify.error('Hata', data.processMessage || 'Hesaplar alınamadı.');
                return [];
            }
        } catch (err) {
            console.error("Account fetch error:", err);
            notify.error('Bağlantı Hatası', 'Hesap bilgileri yüklenemedi.');
            return [];
        } finally {
            setIsLoadingAccounts(false);
        }
    }, [isAuthenticated, selectedAccount]);

    // ==========================================
    // 2. FETCH TRANSACTIONS
    // POST /api/account/transaction/list
    // Request: { accountId, page, size, type?, dateRange? }
    // Response: { transactions: Transaction[], totalPages }
    // ==========================================
    const fetchTransactions = useCallback(async (accountId: string = 'ALL', options?: {
        page?: number;
        size?: number;
        type?: 'ALL' | 'INCOME' | 'EXPENSE';
        dateRange?: 'ALL' | 'WEEK' | 'MONTH';
    }) => {
        setIsLoadingTransactions(true);
        try {
            const response = await fetch('/api/account/transaction/list', {
                method: 'POST',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: accountId,
                    page: options?.page ?? 0,
                    size: options?.size ?? 5,
                    type: options?.type !== 'ALL' ? options?.type : undefined,
                    dateRange: options?.dateRange !== 'ALL' ? options?.dateRange : undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const txList: Transaction[] = data.transactions || data || [];
                setTransactions(txList);

                // Gelir/Gider istatistiklerini hesapla
                const income = txList
                    .filter(tx => tx.type === 'INCOME')
                    .reduce((sum, tx) => sum + tx.amount, 0);
                const expenses = txList
                    .filter(tx => tx.type === 'EXPENSE')
                    .reduce((sum, tx) => sum + tx.amount, 0);

                setStats(prev => ({
                    ...prev,
                    totalIncome: income,
                    totalExpenses: expenses,
                    monthlyIncome: income, // Dashboard için aynı değerleri kullanıyoruz
                    monthlyExpenses: expenses
                }));

                return { transactions: txList, totalPages: data.totalPages || 1 };
            } else {
                notify.error(data.processCode || 'Hata', data.processMessage || 'İşlemler alınamadı.');
                return null;
            }
        } catch (err) {
            console.error("Transactions fetch error:", err);
            notify.error('Sunucu Hatası', 'İşlemler yüklenemedi.');
            return null;
        } finally {
            setIsLoadingTransactions(false);
        }
    }, []);

    // ==========================================
    // 3. FETCH CARDS
    // POST /api/cards/list
    // Request: { accountId }
    // Response: { carts: Card[] }
    // ==========================================
    const fetchCards = useCallback(async (accountId: string) => {
        if (!accountId) return;

        setIsLoadingCards(true);
        try {
            const res = await fetch('/api/cards/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId }),
            });

            const data: CardListResponse = await res.json();

            if (res.ok && data.carts) {
                setCards(data.carts);
                return data.carts;
            } else {
                if (data.processMessage) {
                    notify.error('Hata', data.processMessage);
                }
                setCards([]);
                return [];
            }
        } catch (error) {
            console.error('Failed to fetch cards', error);
            setCards([]);
            return [];
        } finally {
            setIsLoadingCards(false);
        }
    }, []);

    // ==========================================
    // 3b. FETCH ALL CARDS FOR ALL ACCOUNTS
    // Tüm hesaplar için kart sayısını getirir
    // ==========================================
    const fetchAllCards = useCallback(async (accountList: Account[]) => {
        if (!accountList.length) return;

        setIsLoadingCards(true);
        try {
            const cardCounts: Record<string, number> = {};
            let total = 0;

            // Her hesap için kartları getir
            await Promise.all(
                accountList.map(async (account) => {
                    try {
                        const res = await fetch('/api/cards/list', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ accountId: account.id }),
                        });

                        const data: CardListResponse = await res.json();

                        if (res.ok && data.carts) {
                            cardCounts[account.id] = data.carts.length;
                            total += data.carts.length;
                        } else {
                            cardCounts[account.id] = 0;
                        }
                    } catch {
                        cardCounts[account.id] = 0;
                    }
                })
            );

            setCardCountByAccount(cardCounts);
            setTotalCardCount(total);
        } catch (error) {
            console.error('Failed to fetch all cards', error);
        } finally {
            setIsLoadingCards(false);
        }
    }, []);

    // ==========================================
    // 4. FETCH ANALYSIS REPORTS
    // POST /api/analysis/list
    // Request: {}
    // Response: { analysisReports: AnalysisReportDTO[] }
    // ==========================================
    const fetchAnalysisReports = useCallback(async () => {
        setIsLoadingAnalysis(true);
        try {
            const response = await fetch('/api/analysis/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data: AnalysisReportListResponse = await response.json();
                setAnalysisReports(data.analysisReports || []);
            }
        } catch (error) {
            console.error('Error fetching analysis reports:', error);
        } finally {
            setIsLoadingAnalysis(false);
        }
    }, []);

    // ==========================================
    // 5. CREATE ANALYSIS
    // POST /api/analysis/create
    // Request: { analyzeRange: "LAST_7_DAYS" | "LAST_30_DAYS" }
    // Response: { analysisReportId, invoiceRequestId, invoiceStatus, estimatedCompletionDate, invoiceMessage }
    // ==========================================
    const createAnalysis = useCallback(async (range: AnalyzeRange): Promise<boolean> => {
        setIsCreatingAnalysis(true);
        try {
            const response = await fetch('/api/analysis/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analyzeRange: range })
            });

            if (response.ok) {
                notify.success('Başarılı', 'Analiz raporu oluşturuldu.');
                await fetchAnalysisReports();
                return true;
            } else {
                const error = await response.json();
                notify.error('Hata', error.processMessage || 'Analiz oluşturulamadı.');
                return false;
            }
        } catch (error) {
            console.error('Error creating analysis:', error);
            notify.error('Hata', 'Analiz oluşturulurken bir hata oluştu.');
            return false;
        } finally {
            setIsCreatingAnalysis(false);
        }
    }, [fetchAnalysisReports]);

    // ==========================================
    // 6. DOWNLOAD PDF
    // POST /api/invoice/get
    // Request: { transactionId: invoiceId }
    // Response: base64 encoded PDF string
    // ==========================================
    const downloadPdf = useCallback(async (invoiceId: string): Promise<boolean> => {
        if (!invoiceId) return false;

        try {
            const response = await fetch('/api/invoice/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: invoiceId })
            });

            if (response.ok) {
                const pdfBase64 = await response.json();

                // Base64 to Blob conversion
                const byteCharacters = atob(pdfBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Download
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `analiz_raporu_${invoiceId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                return true;
            }
            return false;
        } catch (error) {
            console.error('Error downloading PDF:', error);
            return false;
        }
    }, []);

    // ==========================================
    // INITIAL DATA FETCH
    // ==========================================
    const refreshAll = useCallback(async () => {
        // Önce hesapları al, sonra tüm hesaplar için kartları getir
        const accountList = await fetchAccounts();

        await Promise.all([
            fetchTransactions('ALL', { size: 5 }),
            fetchAnalysisReports(),
            fetchAllCards(accountList)
        ]);
    }, [fetchAccounts, fetchTransactions, fetchAnalysisReports, fetchAllCards]);

    useEffect(() => {
        if (isAuthenticated) {
            refreshAll();
        }
    }, [isAuthenticated]);

    // Seçili hesap değiştiğinde kartları getir
    useEffect(() => {
        if (selectedAccount?.id) {
            fetchCards(selectedAccount.id);
        }
    }, [selectedAccount?.id, fetchCards]);

    return {
        // Data
        accounts,
        selectedAccount,
        setSelectedAccount,
        transactions,
        cards,
        analysisReports,
        stats,
        cardCountByAccount,
        totalCardCount,

        // Loading States
        isLoadingAccounts,
        isLoadingTransactions,
        isLoadingCards,
        isLoadingAnalysis,
        isCreatingAnalysis,

        // Actions
        fetchAccounts,
        fetchTransactions,
        fetchCards,
        fetchAllCards,
        fetchAnalysisReports,
        createAnalysis,
        downloadPdf,
        refreshAll
    };
};
