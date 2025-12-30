import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from 'axios';
import * as authService from "@/src/services/authService";
import { BaseResponse } from '@/src/types/response';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[MCP_INVOKE_PROXY][${requestId}] Request başladı.`);

    try {
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'AUTH_ERR',
                processMessage: 'Oturum süresi dolmuş.'
            }, { status: 401 });
        }

        const functionCall = await request.json();

        const TARGET_URL = `${API_BASE_URL}/mcpserver/v1/api/mcp/invoke`;
        console.log(`[MCP_INVOKE_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);

        const response = await axios.post(TARGET_URL, functionCall, {
            headers: authHeaders,
            timeout: 30000
        });

        const duration = Date.now() - startTime;
        console.log(`[MCP_INVOKE_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json(response.data, { status: 200 });

    } catch (error: unknown) {
        const duration = Date.now() - startTime;
        let statusCode = 500;
        let errorResponse: BaseResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data as any;

            console.error(`[MCP_INVOKE_PROXY][${requestId}] Backend Hatası (${statusCode}):`, responseData);

            if (responseData && (responseData.processCode || responseData.status)) {
                errorResponse = responseData;
            } else {
                errorResponse = {
                    status: 'ERROR',
                    processCode: 'BACKEND_ERR',
                    processMessage: 'MCP invoke işlemi başarısız.'
                };
            }
        } else {
            console.error(`[MCP_INVOKE_PROXY][${requestId}] Kritik Hata:`, error);
            errorResponse = {
                status: 'ERROR',
                processCode: 'INTERNAL_ERR',
                processMessage: 'Sistem hatası.'
            };
        }
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}
