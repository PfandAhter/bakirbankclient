import { NextRequest, NextResponse } from "next/server";
import * as authService from '@/src/services/authService';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeaders = await authService.getAuthHeaders();

        if (!authHeaders) {
            return NextResponse.json(
                { message: "Unauthorized: No access token" },
                { status: 401 }
            );
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/api/v1/transaction/transactionsv2`,
            body,
            { headers: authHeaders }
        );

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error("ERROR OBJECT: ", error.response.data.processMessage);

        // BaseResponse varsa direkt dön
        if (error.response && error.response.data) {
            return NextResponse.json(error.response.data, {
                status: error.response.status,
            });
        }

        // Diğer hatalar
        return NextResponse.json(
            {
                status: "FAILED",
                processCode: "SERVER ERROR",
                processMessage: error.response.data.processMessage,
            },
            { status: 500 }
        );
    }
}
