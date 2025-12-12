// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as authService from '@/app/lib/api/services/authService';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface ChatRequestBody {
    sessionId: string;
    message: string;
}

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[CHAT_PROXY][${requestId}] Request başladı.`);
    try {
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            console.warn(`[CHAT_PROXY][${requestId}] Unauthorized: Auth headers eksik.`);
            return NextResponse.json({ error: 'Oturum süresi dolmuş veya yetkisiz erişim.' }, { status: 401 });
        }

        const body: ChatRequestBody = await request.json();

        if (!body.message || !body.sessionId) {
            return NextResponse.json(
                { error: 'Missing required fields: message and sessionId' },
                { status: 400 }
            );
        }

        const TARGET_URL = `${API_BASE_URL}/mcpserver/chat/message`;

        console.log(`[CHAT_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);
        const response = await axios.post(TARGET_URL, {
            sessionId: body.sessionId,
            message: body.message
        }, {
            headers: authHeaders,
            timeout: 30000 // Chat may take longer
        });

        const duration = Date.now() - startTime;
        console.log(`[CHAT_PROXY][${requestId}] Başarılı. Süre: ${duration}ms. Status: ${response.status}`);

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: unknown) {
        const duration = Date.now() - startTime;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status || 500;
            const errorData = axiosError.response?.data || axiosError.message;

            console.error(`[CHAT_PROXY][${requestId}] Backend Hatası (${duration}ms):`, {
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
        console.error(`[CHAT_PROXY][${requestId}] Kritik Hata (${duration}ms):`, error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: errorMessage },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
