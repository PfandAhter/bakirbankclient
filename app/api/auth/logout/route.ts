import { NextResponse } from 'next/server';
import { logout } from '@/app/lib/api/services/authService';

export async function POST() {
    try {
        await logout();
        return NextResponse.json({ message: 'Logout successful' });
    } catch (error) {
        return NextResponse.json(
            { message: 'Logout failed' },
            { status: 500 }
        );
    }
}