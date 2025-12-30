import type { NextConfig } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: false,

    typescript: {
        ignoreBuildErrors: true,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${API_BASE_URL}/:path*`,
            },
        ];
    },
};

export default nextConfig;