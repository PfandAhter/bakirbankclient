import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as authService from "@/app/lib/api/services/authService";

export async function POST(request: NextRequest) {
    try {
        const functionCall = await request.json();
        const authHeaders = await authService.getAuthHeaders();

        if (!authHeaders) {
            return NextResponse.json(
                { message: "Unauthorized: No access token" },
                { status: 401 }
            );
        }

        console.log("🔹 MCP INVOKE CALL:", functionCall);

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/mcpserver/v1/api/mcp/invoke`,
            functionCall,
            { headers: authHeaders }
        );

        console.log("✅ MCP INVOKE RESPONSE:", response.data);

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error("❌ MCP INVOKE ERROR:", error.response?.data || error.message);

        if (error.response?.data) {
            return NextResponse.json(error.response.data, {
                status: error.response.status,
            });
        }

        return NextResponse.json(
            {
                status: "FAILED",
                processCode: "SERVER_ERROR",
                processMessage: error.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
