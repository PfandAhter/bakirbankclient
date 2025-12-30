// typescript
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import * as authService from '@/src/services/authService';
import { BaseResponse } from '@/src/types/response';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const { searchParams } = new URL(request.url);
    const iban = searchParams.get('iban');

    console.log(`[IBAN_CHECK_PROXY][${requestId}] Request başladı. IBAN: ${iban}`);
    try {
        if (!iban) {
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'VALIDATION_ERR',
                processMessage: 'IBAN parametresi zorunludur.'
            }, { status: 400 });
        }

        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'AUTH_ERR',
                processMessage: 'Yetkisiz erişim.'
            }, { status: 401 });
        }
        const TARGET_URL = `${API_BASE_URL}/account/api/v1/account/get/user/by-iban`;
        const response = await axios.get(TARGET_URL, {
            headers: authHeaders,
            params: { iban },
            timeout: 10000
        });

        console.log(`[IBAN_CHECK_PROXY][${requestId}] Başarılı.`);
        return NextResponse.json(response.data, { status: 200 });
    } catch (error: unknown) {
        let statusCode = 500;
        let errorResponse: BaseResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data as any;
            console.error(`[IBAN_CHECK_PROXY][${requestId}] Backend Hatası:`, responseData);

            if (responseData && (responseData.processCode || responseData.status)) {
                errorResponse = responseData;
            } else {
                errorResponse = {
                    status: 'ERROR',
                    processCode: 'BACKEND_ERR',
                    processMessage: 'IBAN sorgulanamadı.'
                };
            }
        } else {
            console.error(`[IBAN_CHECK_PROXY][${requestId}] Kritik Hata:`, error);
            errorResponse = {
                status: 'ERROR',
                processCode: 'INTERNAL_ERR',
                processMessage: 'Sistem hatası.'
            };
        }
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}