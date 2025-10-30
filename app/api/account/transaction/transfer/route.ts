import { NextRequest, NextResponse } from "next/server";
import * as authService from '@/app/lib/api/services/authService';
import axios from "axios";

/**
 * /api/account/transaction/transfer
 * Kullanıcıdan gelen para transferi isteğini backend'e yönlendirir.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeaders = await authService.getAuthHeaders();
        // Backend API URL
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
        const API_ENDPOINT = `${API_BASE_URL}/transaction/api/v1/transaction/transfer`;

        // Axios isteği
        const response = await axios.post(API_ENDPOINT, body, {
            headers: authHeaders,
            withCredentials: true,
            validateStatus: () => true, // status kontrolünü manuel yapacağız
        });

        // Backend yanıtı
        if (response.status >= 400) {
            return NextResponse.json(
                {
                    processCode: response.data?.processCode || "TRANSFER_FAILED",
                    processMessage: response.data?.processMessage || "Transfer başarısız oldu.",
                },
                { status: response.status }
            );
        }

        // Başarılı yanıt
        return NextResponse.json(response.data, { status: 200 });

    } catch (error: any) {
        console.error("❌ Transfer route error:", error.message || error);

        if (axios.isAxiosError(error)) {
            return NextResponse.json(
                {
                    processCode: "AXIOS_ERROR",
                    processMessage: error.response?.data?.message || "Sunucuya bağlanırken hata oluştu.",
                },
                { status: error.response?.status || 500 }
            );
        }

        return NextResponse.json(
            {
                processCode: "UNEXPECTED_ERROR",
                processMessage: "Beklenmeyen bir hata oluştu.",
            },
            { status: 500 }
        );
    }
}
