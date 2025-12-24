import { NextResponse } from "next/server";
import * as authService from '@/src/services/authService';


interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    gsm: string;
}

export async function POST(request: Request) {
    try {
        const body: RegisterData = await request.json();

        if (!body.name || !body.email || !body.password || !body.confirmPassword || !body.gsm) {
            return NextResponse.json(
                { success: false, message: "Tüm alanlar zorunludur" },
                { status: 400 }
            );
        }

        const response = await authService.register(body);

        console.log("Sign-up route.ts response log: ", response);

        return NextResponse.json(
            { success: true, message: response.processMessage || "Kayıt başarılı" },
            { status: 200 }
        );
    } catch (error) {
        console.error("API Gateway Error:", error);
        return NextResponse.json(
            { success: false, message: "Sunucuya ulaşılamadı" },
            { status: 500 }
        );
    }
}
