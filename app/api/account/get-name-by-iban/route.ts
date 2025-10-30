// typescript
import * as authService from '@/app/lib/api/services/authService';
import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const iban = url.searchParams.get('iban');
        if (!iban) {
            return new Response(JSON.stringify({ error: 'Missing iban query parameter' }), { status: 400 });
        }

        const authHeaders = await authService.getAuthHeaders();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        if (!authHeaders) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        console.log("GET NAME BY IBAN REQUEST FOR IBAN: ", iban);

        const response = await axios.get(
            `${API_BASE_URL}/account/api/v1/account/get/user/by-iban`,
            {
                headers: authHeaders,
                params: { iban },
                withCredentials: true,
                validateStatus: () => true
            }
        );

        console.log("GET NAME BY IBAN RESPONSE: ", response.data);

        if (response.status !== 200) {
            return new Response(JSON.stringify(response.data ?? { message: response.statusText }), { status: response.status });
        }

        return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message || 'Internal server error' }), { status: 500 });
    }
}
