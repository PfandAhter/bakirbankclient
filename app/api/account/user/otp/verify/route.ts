import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        if (!email || !otp) {
            return NextResponse.json(
                { message: 'E-posta ve OTP kodu gereklidir.' },
                { status: 400 }
            );
        }

        const response = await axios.post(`${API_BASE_URL}/account/api/v1/verification/user/verify`,
            { userEmail:email, otp:otp },
            {headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
                validateStatus: () => true
            });

        console.log("EMAIL SEND TO VERIFY RESPONSE ROUTE.TS DOSYASI: ", response);

        const data = await response.data;

        if(response.status !== 200){
            const errorBody = data.processMessage;
            return NextResponse.json(
                { message: errorBody || 'OTP doğrulama başarısız.' },
                { status: data.processCode }
            );
        }

        return NextResponse.json(
            { message: 'Doğrulama başarılı.', data },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('OTP verify error:', error);
        return NextResponse.json(
            { message: 'Sunucu hatası. OTP doğrulanamadı.' },
            { status: 500 }
        );
    }
}
