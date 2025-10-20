import { NextRequest, NextResponse } from "next/server";
import * as authService from '@/app/lib/api/services/authService';
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

        console.log("MCP SEND BODY: ", body);

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/mcpserver/v1/api/mcp/process`,
            body,
            { headers: authHeaders }
        );


        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.log("ALINAN HATA WHEN TRYING TO SEND MESSAGE MCP SERVER: ",error);

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
