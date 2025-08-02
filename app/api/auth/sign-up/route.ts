import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const userData = await request.json();

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Kayıt başarısız' },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'Kayıt başarılı' });
    } catch (err) {
        console.error('Register error:', err);
        return NextResponse.json(
            { message: 'Kayıt sırasında bir hata oluştu' },
            { status: 500 }
        );
    }
}