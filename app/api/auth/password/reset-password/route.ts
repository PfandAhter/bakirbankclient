import {NextRequest, NextResponse} from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const {email, password, confirmPassword} = await request.json();

        if (!email || !password || !confirmPassword) {
            return NextResponse.json(
                {message: 'Sifre sifirlama icin email gereklidir'},
                {status: 400}
            );
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        const response = await axios.post(`${API_BASE_URL}/account/api/v1/verification/user/password/reset`,
            {email: email , password: password , confirmPassword: confirmPassword},
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
                {message: errorBody || 'Sifre Degistirme Islemi Basarisiz.'},
                {status: data.processCode}
            );
        }

        return NextResponse.json(
            {message: 'Sifre degistirme islemi başarılı.', data},
            {status: 200}
        );
    } catch (error: any) {
        console.error('Sifre degistirme islemi error:', error);

        return NextResponse.json(
            {message: error.message || 'Sifre degistirme islemi sirasinda bir hata oluştu'},
            {status: 500}
        );
    }
}