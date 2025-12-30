import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import * as authService from '@/src/services/authService';
import { BaseResponse } from '@/src/types/response';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');

    console.log(`[BRANCH_LIST_PROXY][${requestId}] Request başladı. District: ${district}`);

    try {
        if (!district) {
            console.log(`[BRANCH_LIST_PROXY][${requestId}] Validasyon hatası: District eksik.`);
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'VALIDATION_ERR',
                processMessage: 'District parametresi gereklidir.'
            }, { status: 400 });
        }

        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'AUTH_ERR',
                processMessage: 'Oturum süresi dolmuş.'
            }, { status: 401 });
        }

        const TARGET_URL = `${API_BASE_URL}/account/api/v1/branch/branches`;
        console.log(`[BRANCH_LIST_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);

        const response = await axios.get(TARGET_URL, {
            params: { district },
            headers: authHeaders,
            timeout: 15000
        });

        const duration = Date.now() - startTime;
        console.log(`[BRANCH_LIST_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json(response.data.branches, { status: 200 });

    } catch (error: unknown) {
        const duration = Date.now() - startTime;
        let statusCode = 500;
        let errorResponse: BaseResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data as any;

            console.error(`[BRANCH_LIST_PROXY][${requestId}] Backend Hatası (${statusCode}):`, responseData);

            if (responseData && (responseData.processCode || responseData.status)) {
                errorResponse = responseData;
            } else {
                errorResponse = {
                    status: 'ERROR',
                    processCode: 'BACKEND_ERR',
                    processMessage: 'Şubeler listelenemedi.'
                };
            }
        } else {
            console.error(`[BRANCH_LIST_PROXY][${requestId}] Kritik Hata:`, error);
            errorResponse = {
                status: 'ERROR',
                processCode: 'INTERNAL_ERR',
                processMessage: 'Sistem hatası.'
            };
        }
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}