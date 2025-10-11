import * as authService from '@/app/lib/api/services/authService';
import axios from 'axios';

export async function POST() {
    try {
        const authHeaders = await authService.getAuthHeaders();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';


        if (!authHeaders) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const responsev2 = await axios.post(`${API_BASE_URL}/account/api/v1/account/getv2`, {},{
            headers: authHeaders
        });

        /*const response = await fetch(`${process.env.API_BASE_URL}/account/api/v1/account/get`, {
            headers: authHeaders
        });*/

        console.log("Responsev2:", responsev2);
        //console.log("Response:", response);

        if(responsev2.status !== 200) {
            const errorBody = await responsev2.statusText;
            return new Response(errorBody, { status: responsev2.status });
            //return new Response(JSON.stringify({ error: 'Failed to fetch accounts' }), { status: responsev2.status });
        }

        const data = responsev2.data.accounts;
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}