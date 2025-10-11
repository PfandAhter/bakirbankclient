import { NextRequest, NextResponse } from 'next/server';
import * as authService from '@/app/lib/api/services/authService';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email ve şifre gereklidir' },
                { status: 400 }
            );
        }

        const user = await authService.login(email, password);

        return NextResponse.json({
            user,
            message: 'Giriş başarılı'
        });

    } catch (error: any) {
        console.error('Login error:', error);

        return NextResponse.json(
            { message: error.message || 'Giriş sırasında bir hata oluştu' },
            { status: 500 }
        );
    }
}