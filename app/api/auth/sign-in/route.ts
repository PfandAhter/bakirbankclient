import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import * as authService from '@/src/services/authService';
import { BaseResponse } from '@/src/types/response';

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[AUTH_SIGNIN_PROXY][${requestId}] Request başladı.`);

    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            console.log(`[AUTH_SIGNIN_PROXY][${requestId}] Validasyon hatası: Email veya şifre eksik.`);
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'VALIDATION_ERR',
                processMessage: 'Email ve şifre gereklidir.'
            }, { status: 400 });
        }

        const user = await authService.login(email, password);
        const duration = Date.now() - startTime;
        console.log(`[AUTH_SIGNIN_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json({
            user,
            message: 'Giriş başarılı'
        });

    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`[AUTH_SIGNIN_PROXY][${requestId}] Hata (${duration}ms):`, error.message);

        return NextResponse.json<BaseResponse>({
            status: 'ERROR',
            processCode: 'AUTH_ERR',
            processMessage: error.message || 'Giriş sırasında bir hata oluştu.'
        }, { status: 401 });
    }
}