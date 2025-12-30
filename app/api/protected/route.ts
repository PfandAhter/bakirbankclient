import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BaseResponse } from '@/src/types/response';

export async function GET(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[PROTECTED_PROXY][${requestId}] Request başladı.`);

    try {
        const cookieStore = cookies();
        const sessionCookie = (await cookieStore).get('access_token')?.value;

        if (!sessionCookie) {
            console.log(`[PROTECTED_PROXY][${requestId}] Access token bulunamadı.`);
            return NextResponse.json<BaseResponse>({
                status: 'ERROR',
                processCode: 'AUTH_ERR',
                processMessage: 'Yetkisiz erişim.'
            }, { status: 401 });
        }

        const duration = Date.now() - startTime;
        console.log(`[PROTECTED_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json({ message: 'Protected route accessed successfully' });

    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`[PROTECTED_PROXY][${requestId}] Hata (${duration}ms):`, error.message);

        return NextResponse.json<BaseResponse>({
            status: 'ERROR',
            processCode: 'INTERNAL_ERR',
            processMessage: 'Sistem hatası.'
        }, { status: 500 });
    }
}