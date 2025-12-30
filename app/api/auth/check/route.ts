import { NextRequest, NextResponse } from 'next/server';
import { getAccessTokenFromSession } from '@/src/hooks/login/cookieUtils';
import { getCurrentUser } from '@/src/services/authService';

export async function GET(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[AUTH_CHECK_PROXY][${requestId}] Request başladı.`);

    try {
        const token = await getAccessTokenFromSession();

        if (!token) {
            console.log(`[AUTH_CHECK_PROXY][${requestId}] Token bulunamadı.`);
            return NextResponse.json(
                { authenticated: false },
                { status: 401 }
            );
        }

        const user = await getCurrentUser();
        const duration = Date.now() - startTime;
        console.log(`[AUTH_CHECK_PROXY][${requestId}] Başarılı (${duration}ms).`);

        return NextResponse.json({
            authenticated: true,
            user
        });
    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`[AUTH_CHECK_PROXY][${requestId}] Hata (${duration}ms):`, error.message);

        return NextResponse.json(
            { authenticated: false },
            { status: 401 }
        );
    }
}