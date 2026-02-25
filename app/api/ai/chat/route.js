import { NextResponse } from 'next/server';
import axios from 'axios';

// ── AI Configuration (SERVER-SIDE ONLY) ──────────────────────────────
// No NEXT_PUBLIC_ prefix — keys are NEVER sent to the browser
// They exist only in Node.js server memory during API calls
const CONFIG = {
    mistral: {
        key: process.env.MISTRAL_API_KEY,
        endpoint: 'https://api.mistral.ai/v1/chat/completions',
        model: 'mistral-small-latest'
    },
    gemini: {
        key: process.env.GEMINI_API_KEY,
        models: ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-pro'],
        baseEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
    }
};

// ── Audit Logger ──────────────────────────────────────────────────────
const auditLog = (event, meta = {}) => {
    const timestamp = new Date().toISOString();
    const entry = {
        timestamp,
        event,
        ...meta
    };
    // Production: pipe to your logging service (Datadog, CloudWatch, etc.)
    console.log(`[AUDIT] ${JSON.stringify(entry)}`);
};

// ── Input Sanitization & Validation ──────────────────────────────────
const sanitizeMessages = (messages) => {
    if (!Array.isArray(messages)) throw new Error('Invalid messages format');
    if (messages.length > 50) throw new Error('Too many messages in request');

    return messages.map(m => {
        if (!m || typeof m.content !== 'string') throw new Error('Invalid message content');
        if (m.content.length > 50000) throw new Error('Message content exceeds 50KB limit');

        // Block prompt injection attempts
        const INJECTION_PATTERNS = [
            /ignore\s+previous\s+instructions/gi,
            /disregard\s+all\s+prior/gi,
            /<\|system\|>/gi,
            /<\|assistant\|>/gi,
            /\{\{.*?\}\}/g,  // Template injection
            /\$\{.*?\}/g,    // JS template literals in content
        ];

        let sanitized = m.content;
        INJECTION_PATTERNS.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '[FILTERED]');
        });

        const VALID_ROLES = ['user', 'assistant', 'system'];
        if (!VALID_ROLES.includes(m.role)) throw new Error(`Invalid role: ${m.role}`);

        return { role: m.role, content: sanitized };
    });
};

// ── Gemini Executor ───────────────────────────────────────────────────
const executeGemini = async (messages, responseFormat) => {
    if (!CONFIG.gemini.key) throw new Error("GEMINI_API_KEY not configured on server");

    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const body = {
        contents: userMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        })),
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            ...(responseFormat === "json_object" && { responseMimeType: "application/json" })
        },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ]
    };

    if (systemMessage) {
        body.systemInstruction = { parts: [{ text: systemMessage.content }] };
    }

    for (const model of CONFIG.gemini.models) {
        try {
            const url = `${CONFIG.gemini.baseEndpoint}/${model}:generateContent?key=${CONFIG.gemini.key}`;
            const response = await axios.post(url, body, {
                headers: { "Content-Type": "application/json" },
                timeout: 30000
            });
            const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                auditLog('ai_success', { provider: 'gemini', model });
                return text;
            }
        } catch (e) {
            console.warn(`Gemini ${model} failed: ${e.message}`);
        }
    }
    throw new Error("All Gemini models unavailable");
};

// ── Mistral Executor ──────────────────────────────────────────────────
const executeMistral = async (messages, responseFormat) => {
    if (!CONFIG.mistral.key) throw new Error("MISTRAL_API_KEY not configured on server");

    const response = await axios.post(CONFIG.mistral.endpoint, {
        model: CONFIG.mistral.model,
        messages,
        response_format: { type: responseFormat },
        temperature: 0.2,
        max_tokens: 8192
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CONFIG.mistral.key}`
        },
        timeout: 30000
    });

    const text = response.data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Mistral returned empty response");
    auditLog('ai_success', { provider: 'mistral' });
    return text;
};

// ── Main POST Handler ─────────────────────────────────────────────────
export async function POST(request) {
    const requestId = crypto.randomUUID();
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

    auditLog('api_request', { requestId, ip, path: '/api/ai/chat' });

    try {
        // Validate Content-Type
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            auditLog('api_rejected', { requestId, reason: 'invalid_content_type' });
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            auditLog('api_rejected', { requestId, reason: 'invalid_json' });
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { messages: rawMessages, format } = body;

        let messages;
        try {
            messages = sanitizeMessages(rawMessages);
        } catch (e) {
            auditLog('api_rejected', { requestId, reason: 'validation_failed', error: e.message });
            return NextResponse.json({ error: e.message }, { status: 400 });
        }

        const responseFormat = ['json_object', 'text'].includes(format) ? format : 'json_object';

        // ── AI Fallback Chain
        let content = null;

        try {
            content = await executeGemini(messages, responseFormat);
        } catch (geminiError) {
            auditLog('ai_fallback', { requestId, from: 'gemini', reason: geminiError.message });
            try {
                content = await executeMistral(messages, responseFormat);
            } catch (mistralError) {
                auditLog('ai_failed', { requestId, gemini: geminiError.message, mistral: mistralError.message });
                return NextResponse.json(
                    { error: 'AI Services are currently unavailable. Please try again in a moment.' },
                    { status: 503 }
                );
            }
        }

        auditLog('api_success', { requestId });

        return NextResponse.json({ success: true, content }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'X-Request-ID': requestId,
            }
        });

    } catch (error) {
        auditLog('api_error', { requestId, error: error.message });
        // Never expose internal error details to client
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Block all other HTTP methods
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
export async function PUT() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
export async function DELETE() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
