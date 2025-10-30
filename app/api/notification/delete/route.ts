import * as authService from '@/app/lib/api/services/authService';
import { NextRequest} from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const payload = { notificationId: String(body.notificationId) };

        const authHeaders = await authService.getAuthHeaders();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';


        if (!authHeaders) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const response = await axios.post(`${API_BASE_URL}/notification/api/v1/notification/delete`,
            payload ,
            {
            headers: authHeaders,
            withCredentials: true,
            validateStatus: () => true
        })

        if(response.status !== 200) {
            const errorBody = await response.statusText;
            return new Response(errorBody, { status: response.status });
        }

        return new Response(null, { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}