import React, { useState } from 'react';
import {AlertType} from "@/src/hooks/notification/useAlert";
import { TransferData } from '@/src/types/transaction';

interface UseTransferProps {
    showAlert: (type: AlertType, title: string, message: React.ReactNode) => void;
    onSuccess?: () => Promise<void>;
    fetchTransaction?: () => Promise<void>;
    idempotencyKey: string;
}

export const useTransfer = ({ showAlert, onSuccess, fetchTransaction, idempotencyKey }: UseTransferProps) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [confirmStep, setConfirmStep] = useState(false);

    const validateTransfer = async (data: TransferData): Promise<boolean> => {
        setLoading(true);
        try {
            const res = await fetch("/api/account/transaction/transfer", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-Idempotency-Key": idempotencyKey
                },
                body: JSON.stringify({
                    fromIBAN: data.fromIBAN,
                    toIBAN: data.toIBAN,
                    toFirstName: data.toFirstName,
                    toSecondName: data.toSecondName,
                    toLastName: data.toLastName,
                    byAi: false,
                    amount: data.amount,
                    description: data.description,
                    isConfirmed: false
                }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                showAlert("error", responseData.processCode || "İşlem Başarısız", responseData.processMessage || "Transfer gerçekleştirilemedi.");
                return false;
            }

            setConfirmStep(true);
            return true;
        } catch (error) {
            console.error("Transfer validation error:", error);
            showAlert("error", "Sunucu Hatası", "Lütfen daha sonra tekrar deneyiniz.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const confirmTransfer = async (data: TransferData): Promise<boolean> => {
        setLoading(true);
        try {
            const res = await fetch("/api/account/transaction/transfer", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-Idempotency-Key": idempotencyKey
                },
                body: JSON.stringify({
                    fromIBAN: data.fromIBAN,
                    toIBAN: data.toIBAN,
                    amount: data.amount,
                    description: data.description,
                    byAi: false,
                    toFirstName: data.toFirstName,
                    toSecondName: data.toSecondName,
                    toLastName: data.toLastName,
                    isConfirmed: true
                }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                showAlert("error", responseData.processCode || "Hata", responseData.processMessage || "İşlem tamamlanamadı.");
                return false;
            }

            if (fetchTransaction) {
                await fetchTransaction();
            }

            showAlert("success", "İşlem Başarılı", "Para transferi başarıyla tamamlandı.");
            setSuccess(true);
            setConfirmStep(false);

            if (onSuccess) {
                await onSuccess();
            }

            return true;
        } catch (error) {
            console.error("Final Transfer error:", error);
            showAlert("error", "Sunucu Hatası", "Bağlantı hatası oluştu.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        success,
        confirmStep,
        idempotencyKey,
        setConfirmStep,
        validateTransfer,
        confirmTransfer,
    };
};
