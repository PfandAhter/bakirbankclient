// /app/api/notification/socket/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import * as authService from "@/src/services/authService";
import { BaseResponse } from '@/src/types/response';

// BACKEND NOTIFICATION SERVER
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const NOTIFICATION_SERVER = API_BASE_URL + '/notification-websocket';

// WebSocket proxy route
export async function POST(_request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[NOTIFICATION_SOCKET_PROXY][${requestId}] Request başladı.`);

    try {
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'AUTH_ERR',
                processMessage: 'Oturum süresi dolmuş.'
            }, { status: 401 });
        }

        const TARGET_URL = `${API_BASE_URL}/authentication/validate/with-body`;
        console.log(`[NOTIFICATION_SOCKET_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);

        const response = await axios.post(TARGET_URL, {}, {
            headers: authHeaders,
            withCredentials: true,
            timeout: 15000
        });

        const userId = response.data.id;

        if (!userId) {
            console.log(`[NOTIFICATION_SOCKET_PROXY][${requestId}] UserId alınamadı.`);
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'AUTH_ERR',
                processMessage: 'Kullanıcı doğrulanamadı.'
            }, { status: 401 });
        }

        const duration = Date.now() - startTime;
        console.log(`[NOTIFICATION_SOCKET_PROXY][${requestId}] Başarılı (${duration}ms). UserId: ${userId}`);

        // Bu route direkt WS upgrade desteklemez (Next.js Node/Edge ortamına göre değişir),
        // bu yüzden frontend bu endpointten userId alacak ve direkt kendi WS bağlantısını kuracak.
        return NextResponse.json({
            userId,
            wsUrl: `${NOTIFICATION_SERVER}?userId=${userId}`,
        });

    } catch (error: unknown) {
        const duration = Date.now() - startTime;
        let statusCode = 500;
        let errorResponse: BaseResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data as any;

            console.error(`[NOTIFICATION_SOCKET_PROXY][${requestId}] Backend Hatası (${statusCode}):`, responseData);

            if (responseData && (responseData.processCode || responseData.status)) {
                errorResponse = responseData;
            } else {
                errorResponse = {
                    status: 'ERROR',
                    processCode: 'BACKEND_ERR',
                    processMessage: 'WebSocket bağlantısı kurulamadı.'
                };
            }
        } else {
            console.error(`[NOTIFICATION_SOCKET_PROXY][${requestId}] Kritik Hata:`, error);
            errorResponse = {
                status: 'ERROR',
                processCode: 'INTERNAL_ERR',
                processMessage: 'Sistem hatası.'
            };
        }
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}