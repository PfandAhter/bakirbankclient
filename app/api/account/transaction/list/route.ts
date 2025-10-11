import { NextRequest, NextResponse } from "next/server";
import * as authService from '@/app/lib/api/services/authService';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        // Frontend'den gelen body'yi al
        const body = await request.json();

        // HttpOnly cookie'den access_token'i al
        const authHeaders = await authService.getAuthHeaders();

        if (!authHeaders) {
            return NextResponse.json(
                { message: "Unauthorized: No access token" },
                { status: 401 }
            );
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/api/v1/transaction/transactionsv2`, body,{
            headers: authHeaders
        });

        const data = await response.data;

        if(response.status !== 200){
            const errorBody = await response.statusText;
            return new Response(errorBody, { status: response.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Transaction list route error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
