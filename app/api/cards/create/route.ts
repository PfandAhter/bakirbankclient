import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import * as authService from '@/src/services/authService';
import { BaseResponse } from '@/src/types/response';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[CARD_CREATE_PROXY][${requestId}] Request başladı.`);

    try {
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'AUTH_ERR',
                processMessage: 'Oturum süresi dolmuş.'
            }, { status: 401 });
        }

        const body = await request.json();
        const TARGET_URL = `${API_BASE_URL}/account/api/v1/card/create`;

        console.log(`[CARD_CREATE_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);

        const response = await axios.post(TARGET_URL, body, {
            headers: authHeaders,
            timeout: 20000
        });

        const duration = Date.now() - startTime;
        console.log(`[CARD_CREATE_PROXY][${requestId}] Başarılı. Süre: ${duration}ms.`);

        // Backend 201 dönüyorsa biz de 201 dönüyoruz
        return NextResponse.json(response.data, { status: 201 });

    } catch (error: unknown) {
        const duration = Date.now() - startTime;
        let statusCode = 500;
        let errorResponse: BaseResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data as any;

            console.error(`[CARD_CREATE_PROXY][${requestId}] Backend Hatası (${statusCode}):`, responseData);

            // Backend'den gelen standart hatayı koruyoruz
            if (responseData && (responseData.processCode || responseData.status)) {
                errorResponse = responseData;
            } else {
                // Standart dışı durumlar için
                errorResponse = {
                    status: 'ERROR',
                    processCode: 'BACKEND_ERR',
                    processMessage: 'Kart oluşturulurken sunucu hatası oluştu.'
                };
            }
        } else {
            console.error(`[CARD_CREATE_PROXY][${requestId}] Kritik Hata:`, error);
            errorResponse = {
                status: 'ERROR',
                processCode: 'INTERNAL_ERR',
                processMessage: 'Sistem hatası oluştu.'
            };
        }

        return NextResponse.json(errorResponse, { status: statusCode });
    }
}