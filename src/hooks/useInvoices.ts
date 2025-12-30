import { useState } from 'react';
import { Transaction } from '@/src/types/transaction';

export const useInvoices = (
    showAlert: (type: any, title: string, message: string) => void,
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
) => {
    const [loadingInvoices, setLoadingInvoices] = useState<Record<string, boolean>>({});

    const base64ToBlob = (base64: string, contentType: string): Blob => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: contentType });
    };

    const handleInvoiceClick = async (invoiceId: string) => {
        setLoadingInvoices(prev => ({ ...prev, [invoiceId]: true }));
        try {
            const response = await fetch('/api/invoice/get', {
                method: 'POST',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId: invoiceId }),
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert("error", "İşlem Başarısız", data.processMessage || "Dekont alınamadı.");
                return;
            }

            if (data.status === 'PENDING') {
                showAlert("info", "Dekont Hazırlanıyor", data.message || "İşlem devam ediyor.");
            } else {
                const pdfBlob = base64ToBlob(data, 'application/pdf');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');
                showAlert("success", "Dekont Hazır", "Yeni sekmede açıldı.");

                setTransactions(prev => prev.map(t =>
                    t.id === invoiceId ? { ...t, invoiceStatus: 'COMPLETED' } : t
                ));
            }
        } catch (err) {
            console.error("Invoice error:", err);
            showAlert("error", "Hata", "Dekont alınırken hata oluştu.");
        } finally {
            setLoadingInvoices(prev => ({ ...prev, [invoiceId]: false }));
        }
    };

    return { handleInvoiceClick, loadingInvoices };
};