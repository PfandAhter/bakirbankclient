import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Backend'e logout isteği gönder (eğer gerekiyorsa)
        const token = request.cookies.get('access_token')?.value;

        if (token) {
            // Backend'e logout isteği gönderebilirsiniz
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }).catch(() => {
                // Logout hatası önemli değil, cookie'yi temizle
            });
        }

        const res = NextResponse.json({ message: 'Çıkış başarılı' });

        // Cookie'yi temizle
        res.cookies.set('access_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        });

        return res;
    } catch (err) {
        console.error('Logout error:', err);
        return NextResponse.json(
            { message: 'Çıkış sırasında bir hata oluştu' },
            { status: 500 }
        );
    }
}