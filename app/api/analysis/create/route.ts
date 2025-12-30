import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import * as authService from '@/src/services/authService';
import { BaseResponse } from '@/src/types/response';
import { AnalyzeTransactionRequest } from '@/src/types/analysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[ANALYSIS_CREATE_PROXY][${requestId}] Request başladı.`);

    try {
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: AnalyzeTransactionRequest = await request.json();

        if (!body.analyzeRange) {
            return NextResponse.json({
                status: 'ERROR',
                processCode: 'VALIDATION_ERR',
                processMessage: 'Analiz aralığı seçilmelidir.'
            }, { status: 400 });
        }

        const TARGET_URL = `${API_BASE_URL}/analysis/api/v1/analysis/transactions`;
        const response = await axios.post(TARGET_URL, body, {
            headers: authHeaders,
            timeout: 30000 // Analiz oluşturma daha uzun sürebilir
        });

        const duration = Date.now() - startTime;
        console.log(`[ANALYSIS_CREATE_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json(response.data, { status: 200 });

    } catch (error: unknown) {
        let statusCode = 500;
        let errorResponse: BaseResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data as any;
            console.error(`[ANALYSIS_CREATE_PROXY][${requestId}] Backend Hatası:`, responseData);

            if (responseData && responseData.processCode) {
                errorResponse = responseData;
            } else {
                errorResponse = {
                    status: 'ERROR',
                    processCode: 'BACKEND_ERR',
                    processMessage: 'Analiz oluşturulamadı.'
                };
            }
        } else {
            console.error(`[ANALYSIS_CREATE_PROXY][${requestId}] Kritik Hata:`, error);
            errorResponse = {
                status: 'ERROR',
                processCode: 'INTERNAL_ERR',
                processMessage: 'Sistem hatası.'
            };
        }
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}
