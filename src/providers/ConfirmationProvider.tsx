'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AdditionalApproveStatus = 'APPROVED' | 'REJECTED' | 'BLOCK_ACCOUNT';

interface ConfirmationRequest {
    transactionId: string;
    message: string;
    title: string;
    timestamp: string;
}

interface ConfirmationContextType {
    pendingConfirmation: ConfirmationRequest | null;
    showConfirmation: (request: ConfirmationRequest) => void;
    clearConfirmation: () => void;
    handleResponse: (status: AdditionalApproveStatus) => Promise<void>;
    isProcessing: boolean;
}

const ConfirmationContext = createContext<ConfirmationContextType>({
    pendingConfirmation: null,
    showConfirmation: () => {},
    clearConfirmation: () => {},
    handleResponse: async () => {},
    isProcessing: false,
});

export const useConfirmation = () => useContext(ConfirmationContext);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
    const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationRequest | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const showConfirmation = (request: ConfirmationRequest) => {
        setPendingConfirmation(request);
    };

    const clearConfirmation = () => {
        setPendingConfirmation(null);
    };

    const handleResponse = async (status: AdditionalApproveStatus) => {
        if (!pendingConfirmation) return;

        setIsProcessing(true);
        try {
            const res = await fetch('/api/account/transaction/additional-approve', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId: pendingConfirmation.transactionId,
                    status: status,
                }),
            });

            if (!res.ok) {
                throw new Error('İşlem başarısız');
            }

            clearConfirmation();
        } catch (error) {
            console.error('❌ Onay işlemi başarısız:', error);
            alert('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ConfirmationContext.Provider
            value={{
                pendingConfirmation,
                showConfirmation,
                clearConfirmation,
                handleResponse,
                isProcessing,
            }}
        >
            {children}
        </ConfirmationContext.Provider>
    );
}