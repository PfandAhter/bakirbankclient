import * as authService from '@/app/lib/api/services/authService';
import axios from 'axios';
import {NextRequest} from "next/server";

export async function POST(request: NextRequest) {
    try {
        const authHeaders = await authService.getAuthHeaders();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const { transactionId } = await request.json();

        if (!authHeaders) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        if(!transactionId){
            return new Response();//todo: handle this.
        }

        const responsev2 = await axios.post(`${API_BASE_URL}/invoice/api/invoices/get/v2`,
            {id: transactionId},{
            headers: authHeaders
        });

        if(responsev2.status !== 200) {
            const errorBody = await responsev2.statusText;
            return new Response(errorBody, { status: responsev2.status });
            //return new Response(JSON.stringify({ error: 'Failed to fetch accounts' }), { status: responsev2.status });
        }

        const data = responsev2.data.pdf;
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}