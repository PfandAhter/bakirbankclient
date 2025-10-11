import * as authService from '@/app/lib/api/services/authService';
import axios from 'axios';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district');

        if (!district) {
            return new Response(JSON.stringify({ error: "District param is required" }), { status: 400 });
        }
        const authHeaders = await authService.getAuthHeaders();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';



        const response = await axios.get(`${API_BASE_URL}/account/api/v1/branch/branches?district=${encodeURIComponent(district)}`, {
            headers: authHeaders
        });

        return new Response(JSON.stringify(response.data.branches), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("❌ Error fetching districts:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}