import * as authService from '@/src/services/authService';
import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function GET() {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[ATM_STATUSES_PROXY][${requestId}] Request başladı.`);
    try {
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            console.warn(`[ATM_STATUSES_PROXY][${requestId}] Unauthorized: Auth headers eksik.`);
            return NextResponse.json({ error: 'Oturum süresi dolmuş veya yetkisiz erişim.' }, { status: 401 });
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const TARGET_URL = `${API_BASE_URL}/atm/api/v1/atm/get-statuses`;

        console.log(`[ATM_STATUSES_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);
        const response = await axios.get(TARGET_URL, {
            headers: authHeaders,
            timeout: 10000
        });

        const duration = Date.now() - startTime;
        console.log(`[ATM_STATUSES_PROXY][${requestId}] Başarılı. Süre: ${duration}ms. Status: ${response.status}`);

        // Backend ATMStatusResponse: { banks, statuses, depositStatuses, withdrawStatuses }
        return NextResponse.json(response.data, { status: 200 });
    } catch (error: unknown) {
        const duration = Date.now() - startTime;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status || 500;
            const errorData = axiosError.response?.data || axiosError.message;

            console.error(`[ATM_STATUSES_PROXY][${requestId}] Backend Hatası (${duration}ms):`, {
                status: status,
                url: axiosError.config?.url,
                message: axiosError.message,
                responseData: errorData
            });

            return NextResponse.json(
                { error: 'Backend servisinde hata oluştu.', details: errorData },
                { status: status }
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[ATM_STATUSES_PROXY][${requestId}] Kritik Hata (${duration}ms):`, error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: errorMessage },
            { status: 500 }
        );
    }
}