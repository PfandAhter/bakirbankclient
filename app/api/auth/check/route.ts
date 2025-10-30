import { NextResponse } from 'next/server';
import { getAccessTokenFromSession } from '@/app/lib/store/cookieUtils';
import { getCurrentUser } from '@/app/lib/api/services/authService';

export async function GET() {
    try {
        const token = await getAccessTokenFromSession();

        if (!token) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 }
            );
        }

        const user = await getCurrentUser();

        return NextResponse.json({
            authenticated: true,
            user
        });
    } catch (error) {
        return NextResponse.json(
            { authenticated: false },
            { status: 401 }
        );
    }
}