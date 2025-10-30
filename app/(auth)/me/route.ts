import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('access_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Token bulunamadı' },
                { status: 401 }
            );
        }

        // Backend'den kullanıcı bilgilerini al
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // Token geçersizse cookie'yi temizle
            if (response.status === 401) {
                const res = NextResponse.json(
                    { message: 'Token geçersiz' },
                    { status: 401 }
                );
                res.cookies.set('access_token', '', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 0,
                    path: '/',
                });
                return res;
            }

            return NextResponse.json(
                { message: data.message || 'Kullanıcı bilgileri alınamadı' },
                { status: response.status }
            );
        }

        return NextResponse.json({ user: data.user });
    } catch (err) {
        console.error('Get user error:', err);
        return NextResponse.json(
            { message: 'Kullanıcı bilgileri alınırken hata oluştu' },
            { status: 500 }
        );
    }
}