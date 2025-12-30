import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/src/services/authService';
import { BaseResponse } from '@/src/types/response';

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[AUTH_LOGOUT_PROXY][${requestId}] Request başladı.`);

    try {
        await logout();
        const duration = Date.now() - startTime;
        console.log(`[AUTH_LOGOUT_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json({ message: 'Logout successful' });
    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`[AUTH_LOGOUT_PROXY][${requestId}] Hata (${duration}ms):`, error.message);

        return NextResponse.json<BaseResponse>({
            status: 'ERROR',
            processCode: 'LOGOUT_ERR',
            processMessage: 'Logout failed'
        }, { status: 500 });
    }
}