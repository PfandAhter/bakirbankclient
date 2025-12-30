import type { NextConfig } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: false,
    // ESLint build'de çalışmasın - bellek sorunlarını önler
    eslint: {
        ignoreDuringBuilds: true,
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