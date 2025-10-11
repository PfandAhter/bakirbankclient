import * as authService from '@/app/lib/api/services/authService';
import axios from 'axios';

export async function GET() {
    try {
        const authHeaders = await authService.getAuthHeaders();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        if (!authHeaders) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const responsev2 = await axios.get(`${API_BASE_URL}/account/api/v1/branch/cities`, {
            headers: authHeaders
        })

        if(responsev2.status !== 200) {
            const errorBody = await responsev2.statusText;
            return new Response(errorBody, { status: responsev2.status });
        }

        const data = responsev2.data.cities;
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}