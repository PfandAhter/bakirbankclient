// /app/api/notification/socket/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as authService from "@/app/lib/api/services/authService";
import axios from "axios";

// BACKEND NOTIFICATION SERVER
const NOTIFICATION_SERVER = 'http://localhost:8080/notification-websocket';

// WebSocket proxy route
export async function POST(req: NextRequest) {
    try{
        const authHeaders = await authService.getAuthHeaders();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        const response = await axios.post(`${API_BASE_URL}/authentication/validate/with-body`,{},{
            headers: authHeaders,
            withCredentials: true,
            validateStatus: () =>  true
        });

        if(response.status !== 200) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const userId = response.data.id;

        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Bu route direkt WS upgrade desteklemez (Next.js Node/Edge ortamına göre değişir),
        // bu yüzden frontend bu endpointten userId alacak ve direkt kendi WS bağlantısını kuracak.
        return NextResponse.json({
            userId,
            wsUrl: `${NOTIFICATION_SERVER}?userId=${userId}`,
        });
    }catch(error){
        console.error("WebSocket Auth Validation Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}