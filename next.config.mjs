/** @type {import('next').NextConfig} */
const nextConfig = {
    // NO output: 'export' — Vercel runs Next.js natively with API routes
    reactStrictMode: true,
    poweredByHeader: false,
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },

    // Stub Node.js-only modules that exceljs pulls in (rimraf, fstream)
    // These are only used by exceljs's ZIP reader — not our write path
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            rimraf: false,
            fstream: false,
            fs: false,
            path: false,
            stream: false,
        };
        return config;
    },

    // Compiler optimizations for production performance
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production', // Strip console.logs in prod
    },

    // Image optimization via Vercel CDN
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },

    // Enterprise Security Headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: blob:",
                            // Only allow AI providers — no other external connections
                            "connect-src 'self' https://generativelanguage.googleapis.com https://api.mistral.ai",
                            "frame-ancestors 'none'",
                        ].join('; ')
                    },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/api/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                ],
            },
        ];
    },

    // Redirect /CompassQA paths to root (for users coming from old GitHub Pages link)
    async redirects() {
        return [
            {
                source: '/CompassQA/:path*',
                destination: '/:path*',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
