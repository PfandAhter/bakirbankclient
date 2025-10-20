import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const { email} = await request.json();

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        if (!email) {
            return NextResponse.json(
                { message: 'E-posta gereklidir.' },
                { status: 400 }
            );
        }

        const response = await axios.post(`${API_BASE_URL}/account/api/v1/verification/user/verify/cancel`,
            { email:email },
            {headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
                validateStatus: () => true
            });

        console.log("USER VERIFICATION CANCEL ROUTE RESPONSE: ", response);

        const data = await response.data;

        if(response.status !== 200){
            const errorBody = data.processMessage;
            return NextResponse.json(
                { message: errorBody || 'Silme islemi Basarisiz' },
                { status: data.processCode }
            );
        }

        return NextResponse.json(
            { message: 'Silme islemi basarili', data },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('User Verify cancel error:', error);
        return NextResponse.json(
            { message: 'Sunucu hatası. Kullanici silinemedi.' },
            { status: 500 }
        );
    }
}
