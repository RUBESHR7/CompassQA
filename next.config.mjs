/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/CompassQA',
    images: {
        unoptimized: true,
    },
    reactStrictMode: true,
    poweredByHeader: false,

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
                ],
            },
        ];
    },
};

export default nextConfig;
