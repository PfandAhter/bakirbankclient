import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Input validation
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email ve şifre gereklidir' },
                { status: 400 }
            );
        }

        console.log('Login attempt for:', email); // Debug için

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('Backend response:', response.status, data); // Debug için

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Giriş başarısız' },
                { status: response.status }
            );
        }

        // Success response
        const res = NextResponse.json({
            user: data.user,
            message: 'Giriş başarılı'
        });

        // Set cookie
        res.cookies.set('access_token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 1, // 1 day
            path: '/',
        });

        return res;

    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json(
            { message: 'Sunucu hatası oluştu' },
            { status: 500 }
        );
    }
}

// GET method'u da ekleyelim (eğer gerekirse)
export async function GET() {
    return NextResponse.json(
        { message: 'Bu endpoint yalnızca POST isteklerini kabul eder' },
        { status: 405 }
    );
}