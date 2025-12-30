// app/api/transaction/transfer/atm/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from 'axios';
import * as authService from '@/src/services/authService';
import { BaseResponse } from '@/src/types/response';
import { TransferMoneyATMRequest } from "@/src/types/transaction";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[ATM_TRANSFER_PROXY][${requestId}] Request başladı.`);

    try {
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            console.warn(`[ATM_TRANSFER_PROXY][${requestId}] Auth headers alınamadı.`);
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'AUTH_ERR',
                processMessage: 'Oturum süresi dolmuş.'
            }, { status: 401 });
        }

        const body: TransferMoneyATMRequest = await request.json();

        console.log(`[ATM_TRANSFER_PROXY][${requestId}] Request body:`, {
            atmId: body.atmId,
            senderIban: body.senderIban?.slice(-4),
            receiverIban: body.receiverIban?.slice(-4),
            receiverTckn: body.receiverTckn ? '***' + body.receiverTckn.slice(-4) : undefined,
            amount: body.amount
        });

        const TARGET_URL = `${API_BASE_URL}/transaction/api/v1/transaction/transfer/atm`;
        console.log(`[ATM_TRANSFER_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);

        const response = await axios.post(TARGET_URL, body, {
            headers: authHeaders,
            timeout: 30000
        });

        const duration = Date.now() - startTime;
        console.log(`[ATM_TRANSFER_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json(response.data, { status: 200 });

    } catch (error: unknown) {
        const duration = Date.now() - startTime;
        let statusCode = 500;
        let errorResponse: BaseResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data as any;

            console.error(`[ATM_TRANSFER_PROXY][${requestId}] Backend Hatası (${statusCode}) (${duration}ms):`, responseData);

            if (responseData && (responseData.processCode || responseData.status)) {
                errorResponse = responseData;
            } else {
                errorResponse = {
                    status: 'ERROR',
                    processCode: 'BACKEND_ERR',
                    processMessage: 'Transfer işlemi sırasında sunucu hatası oluştu.'
                };
            }
        } else {
            console.error(`[ATM_TRANSFER_PROXY][${requestId}] Kritik Hata (${duration}ms):`, error);
            errorResponse = {
                status: 'ERROR',
                processCode: 'INTERNAL_ERR',
                processMessage: 'Sistem hatası oluştu.'
            };
        }

        return NextResponse.json(errorResponse, { status: statusCode });
    }
}