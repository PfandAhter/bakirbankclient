import * as authService from '@/app/lib/api/services/authService';
import axios from 'axios';

export async function POST() {
    try {
        const authHeaders = await authService.getAuthHeaders();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        if (!authHeaders) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        //const userId = await getUserId(authHeaders);

        const response = await axios.post(`${API_BASE_URL}/notification/api/v1/notification/get`, { },{
            headers: authHeaders
        })

        if(response.status !== 200) {
            const errorBody = await response.statusText;
            return new Response(errorBody, { status: response.status });
        }
        const data = response.data.notifications;

        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}


async function getUserId(authHeaders: any) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const response = await axios.get(`${API_BASE_URL}/authentication/validate`, {
        headers: authHeaders
    });

    return response.data.id;
}