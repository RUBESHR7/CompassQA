import { NextResponse } from 'next/server';

// In-memory rate limiting store (resets on restart)
const rateLimitStore = new Map();

const RATE_LIMIT = {
    windowMs: 60 * 1000,  // 1 minute
    max: 20,              // max 20 requests per minute per IP
    apiMax: 10,           // max 10 AI API calls per minute per IP
};

const getClientIp = (request) => {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    return forwarded?.split(',')[0] ?? real ?? 'unknown';
};

const checkRateLimit = (key, maxRequests) => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.windowMs;

    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key).filter(time => time > windowStart);
    requests.push(now);
    rateLimitStore.set(key, requests);

    return {
        allowed: requests.length <= maxRequests,
        remaining: Math.max(0, maxRequests - requests.length),
        total: requests.length,
    };
};

// Clean up store every 5 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, times] of rateLimitStore.entries()) {
        const valid = times.filter(t => t > now - RATE_LIMIT.windowMs);
        if (valid.length === 0) rateLimitStore.delete(key);
        else rateLimitStore.set(key, valid);
    }
}, 5 * 60 * 1000);

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';

    // ── 1. Bot Detection ─────────────────────────────────────────────
    const suspiciousBots = ['sqlmap', 'nikto', 'masscan', 'zgrab', 'nmap', 'dirbuster'];
    const isSuspiciousBot = suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot));
    if (isSuspiciousBot) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // ── 2. API Route Rate Limiting ────────────────────────────────────
    if (pathname.startsWith('/api/')) {
        const key = `api:${ip}`;
        const { allowed, remaining } = checkRateLimit(key, RATE_LIMIT.apiMax);

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait before trying again.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': '60',
                        'X-RateLimit-Limit': String(RATE_LIMIT.apiMax),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }
    }

    // ── 3. General Rate Limiting ──────────────────────────────────────
    const pageKey = `page:${ip}`;
    const { allowed: pageAllowed } = checkRateLimit(pageKey, RATE_LIMIT.max);
    if (!pageAllowed) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    // ── 4. Security Headers ───────────────────────────────────────────
    const response = NextResponse.next();

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Restrict browser features
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
    );

    // Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Next.js requires these
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob:",
            "connect-src 'self' https://generativelanguage.googleapis.com https://api.mistral.ai",
            "frame-ancestors 'none'",
        ].join('; ')
    );

    // HSTS (only in production - prevents downgrade attacks)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    // Remove fingerprinting headers
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
