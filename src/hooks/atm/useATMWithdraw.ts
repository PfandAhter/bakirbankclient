import { useState, useCallback } from 'react';
import { BaseResponse } from '@/src/types/response';

interface ATMWithdrawRequest {
    atmId: string;
    iban?: string;
    tckn?: string;
}

interface UseATMWithdrawResult {
    withdrawFromATM: (request: ATMWithdrawRequest) => Promise<BaseResponse>;
    loading: boolean;
    error: string | null;
    success: boolean;
    response: BaseResponse | null;
    reset: () => void;
}

export const useATMWithdraw = (): UseATMWithdrawResult => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [response, setResponse] = useState<BaseResponse | null>(null);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setSuccess(false);
        setResponse(null);
    }, []);

    const withdrawFromATM = useCallback(async (request: ATMWithdrawRequest): Promise<BaseResponse> => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setResponse(null);

        try {
            const res = await fetch('/api/transaction/withdraw/atm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    atmId: request.atmId,
                    iban: request.iban || "",
                    tckn: request.tckn || ""
                }),
            });

            const data: BaseResponse = await res.json();

            if (!res.ok || data.status === 'ERROR') {
                setError(data.processMessage || 'İşlem başarısız.');
                setResponse(data);
                return data;
            }

            setSuccess(true);
            setResponse(data);
            return data;

        } catch (err: any) {
            const errorMessage = err.message || 'Beklenmeyen bir hata oluştu.';
            setError(errorMessage);
            const errorResponse: BaseResponse = {
                status: 'ERROR',
                processCode: 'NETWORK_ERR',
                processMessage: errorMessage
            };
            setResponse(errorResponse);
            return errorResponse;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        withdrawFromATM,
        loading,
        error,
        success,
        response,
        reset
    };
};
