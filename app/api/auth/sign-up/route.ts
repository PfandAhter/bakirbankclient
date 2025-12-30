import { NextRequest, NextResponse } from "next/server";
import * as authService from '@/src/services/authService';
import { BaseResponse } from '@/src/types/response';

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    gsm: string;
}

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[AUTH_SIGNUP_PROXY][${requestId}] Request başladı.`);

    try {
        const body: RegisterData = await request.json();

        if (!body.name || !body.email || !body.password || !body.confirmPassword || !body.gsm) {
            console.log(`[AUTH_SIGNUP_PROXY][${requestId}] Validasyon hatası: Eksik alanlar.`);
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'VALIDATION_ERR',
                processMessage: 'Tüm alanlar zorunludur.'
            }, { status: 400 });
        }

        const response = await authService.register(body);
        const duration = Date.now() - startTime;
        console.log(`[AUTH_SIGNUP_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json({
            success: true,
            message: response.processMessage || "Kayıt başarılı"
        }, { status: 200 });

    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`[AUTH_SIGNUP_PROXY][${requestId}] Hata (${duration}ms):`, error.message);

        return NextResponse.json<BaseResponse>({
            status: 'ERROR',
            processCode: 'REGISTER_ERR',
            processMessage: error.message || 'Sunucuya ulaşılamadı.'
        }, { status: 500 });
    }
}
