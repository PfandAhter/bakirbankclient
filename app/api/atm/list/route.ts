import * as authService from '@/src/services/authService';
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function GET(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const id = request.nextUrl.searchParams.get('id');

    console.log(`[ATM_PROXY][${requestId}] Request Başladı. Params: { id: ${id} }`);
    try {
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            console.warn(`[ATM_PROXY][${requestId}] Unauthorized: Auth headers eksik.`);
            return NextResponse.json({ error: 'Oturum süresi dolmuş veya yetkisiz erişim.' }, { status: 401 });
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const TARGET_URL = `${API_BASE_URL}/atm/api/v1/atm/get`;

        console.log(`[ATM_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);
        const response = await axios.get(TARGET_URL, {
            params: { id },
            headers: authHeaders,
            timeout: 10000
        });

        const duration = Date.now() - startTime;
        console.log(`[ATM_PROXY][${requestId}] Başarılı. Süre: ${duration}ms. Status: ${response.status}`);

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        const duration = Date.now() - startTime;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status || 500;
            const errorData = axiosError.response?.data || axiosError.message;

            console.error(`[ATM_PROXY][${requestId}] Backend Hatası (${duration}ms):`, {
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

        console.error(`[ATM_PROXY][${requestId}] Kritik Hata (${duration}ms):`, error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}