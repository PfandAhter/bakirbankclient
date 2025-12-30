import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { BaseResponse } from '@/src/types/response';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[PASSWORD_VERIFY_OTP_PROXY][${requestId}] Request başladı.`);

    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            console.log(`[PASSWORD_VERIFY_OTP_PROXY][${requestId}] Validasyon hatası: Email veya OTP eksik.`);
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'VALIDATION_ERR',
                processMessage: 'Şifre sıfırlama doğrulama için OTP kodu ve email gereklidir.'
            }, { status: 400 });
        }

        const TARGET_URL = `${API_BASE_URL}/account/api/v1/verification/user/password/verify-user-otp`;
        console.log(`[PASSWORD_VERIFY_OTP_PROXY][${requestId}] Backend'e istek atılıyor: ${TARGET_URL}`);

        const response = await axios.post(TARGET_URL,
            { email, otp },
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
                timeout: 15000
            });

        const duration = Date.now() - startTime;
        console.log(`[PASSWORD_VERIFY_OTP_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json({
            message: 'Doğrulama işlemi başarılı.',
            data: response.data
        }, { status: 200 });

    } catch (error: unknown) {
        const duration = Date.now() - startTime;
        let statusCode = 500;
        let errorResponse: BaseResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status || 500;
            const responseData = axiosError.response?.data as any;

            console.error(`[PASSWORD_VERIFY_OTP_PROXY][${requestId}] Backend Hatası (${statusCode}):`, responseData);

            if (responseData && (responseData.processCode || responseData.status)) {
                errorResponse = responseData;
            } else {
                errorResponse = {
                    status: 'ERROR',
                    processCode: 'BACKEND_ERR',
                    processMessage: responseData?.processMessage || 'OTP doğrulama işlemi başarısız.'
                };
            }
        } else {
            console.error(`[PASSWORD_VERIFY_OTP_PROXY][${requestId}] Kritik Hata:`, error);
            errorResponse = {
                status: 'ERROR',
                processCode: 'INTERNAL_ERR',
                processMessage: 'Sistem hatası.'
            };
        }
        return NextResponse.json(errorResponse, { status: statusCode });
    }
}