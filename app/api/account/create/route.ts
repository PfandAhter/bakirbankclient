import { NextRequest, NextResponse } from "next/server";
import * as authService from '@/app/lib/api/services/authService';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        // Frontend'den gelen body verisini al
        const body = await request.json();

        // Auth cookie’yi HttpOnly cookie’den al
        const authHeaders = await authService.getAuthHeaders();
        if (!authHeaders) {
            return NextResponse.json(
                { message: "Unauthorized: No access token provided" },
                { status: 401 }
            );
        }
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        const response = axios.post(`${API_BASE_URL}/account/api/v1/account/create`, body,{
            headers: authHeaders
        });

        if(response.status !== 200){
            const errorBody = await response.statusText;
            return new Response(errorBody, { status: response.status });
        }

        // Backend’e istek at
        /*const backendResponse = await fetch(
            `${process.env.API_BASE_URL}/account/api/v1/account/create`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify(body),
            }
        );*/

        // Backend'den gelen cevabı oku
        const data = await response.json();

        // Backend hata döndürdüyse yakala
        if (!response.ok) {
            return NextResponse.json(
                {
                    message: data.message || "Account creation failed",
                    status: response.status,
                },
                { status: response.status }
            );
        }

        // Başarılı cevap
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Account creation route error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}