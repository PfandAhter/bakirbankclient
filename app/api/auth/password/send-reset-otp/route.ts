import {NextRequest, NextResponse} from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const {email} = await request.json();

        if (!email) {
            return NextResponse.json(
                {message: 'Sifre sifirlama icin email gereklidir'},
                {status: 400}
            );
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        const response = await axios.post(`${API_BASE_URL}/account/api/v1/verification/user/password/send-reset-otp`,
            {email: email},
            {
                headers: {'Content-Type': 'application/json'},
                withCredentials: true,
                validateStatus: () => true
            });

        console.log("SEND RESET OTP RESPONSE ROUTE.TS DOSYASI: ", response);

        const data = await response.data;

        if (response.status !== 200) {
            const errorBody = data.processMessage;
            return NextResponse.json(
                {message: errorBody || 'Email Gonderme Islemi Basarisiz.'},
                {status: data.processCode}
            );
        }

        return NextResponse.json(
            {message: 'Email Gonderme başarılı.', data},
            {status: 200}
        );
    } catch (error: any) {
        console.error('Sifre sifirlama icin gonderilen email error:', error);

        return NextResponse.json(
            {message: error.message || 'Mail Gonderme sırasında bir hata oluştu'},
            {status: 500}
        );
    }
}