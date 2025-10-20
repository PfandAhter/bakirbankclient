import {NextRequest, NextResponse} from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const {email , otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                {message: 'Sifre sifirlama dogrulama icin OTP kodu ve email gereklidir'},
                {status: 400}
            );
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        const response = await axios.post(`${API_BASE_URL}/account/api/v1/verification/user/password/verify-user-otp`,
            {email: email, otp: otp},
            {
                headers: {'Content-Type': 'application/json'},
                withCredentials: true,
                validateStatus: () => true
            });

        console.log("VERIFY PASSWORD RESET OTP RESPONSE ROUTE.TS DOSYASI: ", response);

        const data = await response.data;

        if (response.status !== 200) {
            const errorBody = data.processMessage;
            return NextResponse.json(
                {message: errorBody || 'OTP ile email dogrulama islemi basarisiz.'},
                {status: data.processCode}
            );
        }

        return NextResponse.json(
            {message: 'Dogrulama islemi basarili', data},
            {status: 200}
        );
    } catch (error: any) {
        console.error('Dogrulama hatasi:', error);

        return NextResponse.json(
            {message: error.message || 'Dogrulama sirasinda bir hata olustu'},
            {status: 500}
        );
    }
}