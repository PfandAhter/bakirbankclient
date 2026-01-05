import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from 'axios';
import * as authService from '@/src/services/authService';
import { BaseResponse } from '@/src/types/response';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * /api/transaction/withdraw/atm
 * ATM üzerinden kartsız para çekme isteğini backend'e yönlendirir.
 * 
 * Bu endpoint giriş gerektirmez - ATM simülasyonu için kullanılır.
 */
export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[ATM_WITHDRAW_PROXY][${requestId}] Request başladı.`);

    try {
        const body = await request.json();

        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'AUTH_ERR',
                processMessage: 'Oturum süresi dolmuş.'
            }, { status: 401 });
        }

        // Validate request body
        if (!body.atmId) {
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'VALIDATION_ERR',
                processMessage: 'ATM ID gereklidir.'
            }, { status: 400 });
        }

        if (!body.iban && !body.tckn) {
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'VALIDATION_ERR',
                processMessage: 'IBAN veya TCKN gereklidir.'
            }, { status: 400 });
        }

        const atmWithdrawRequest = {
            atmId: body.atmId,
            iban: body.iban || "",
            tckn: body.tckn || ""
        };

        const TARGET_URL = `${API_BASE_URL}/transaction/api/v1/transaction/withdraw/atm`;
        console.log(`[ATM_WITHDRAW_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);

        const response = await axios.post(TARGET_URL, atmWithdrawRequest, {
            headers: authHeaders,
            timeout: 20000
        });

        const duration = Date.now() - startTime;
        console.log(`[ATM_WITHDRAW_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json(response.data, { status: 200 });

    } catch (error: unknown) {
        const duration = Date.now() - startTime;
        let statusCode = 500;
        let errorResponse: BaseResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data as any;

            console.error(`[ATM_WITHDRAW_PROXY][${requestId}] Backend Hatası (${statusCode}):`, responseData);

            if (responseData && (responseData.processCode || responseData.status)) {
                errorResponse = responseData;
            } else {
                errorResponse = {
                    status: 'ERROR',
                    processCode: 'BACKEND_ERR',
                    processMessage: 'ATM para çekme işlemi başarısız.'
                };
            }
        } else {
            console.error(`[ATM_WITHDRAW_PROXY][${requestId}] Kritik Hata:`, error);
            errorResponse = {
                status: 'ERROR',
                processCode: 'INTERNAL_ERR',
                processMessage: 'Sistem hatası.'
            };
        }
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}
