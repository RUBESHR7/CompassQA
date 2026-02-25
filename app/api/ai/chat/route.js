import { NextResponse } from 'next/server';
import axios from 'axios';

// ── AI Configuration ──────────────────────────────────────────────────
// Keys are read server-side ONLY — never exposed to the browser
const CONFIG = {
    mistral: {
        key: process.env.NEXT_PUBLIC_MISTRAL_API_KEY || process.env.MISTRAL_API_KEY,
        endpoint: 'https://api.mistral.ai/v1/chat/completions',
        model: 'mistral-small-latest'
    },
    gemini: {
        // Try models in order of stability
        key: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
        models: ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-pro'],
        baseEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
    }
};

// ── Input Sanitization ────────────────────────────────────────────────
const sanitizeMessages = (messages) => {
    if (!Array.isArray(messages)) throw new Error('Invalid messages format');
    if (messages.length > 50) throw new Error('Too many messages in request');

    return messages.map(m => {
        if (typeof m.content !== 'string') throw new Error('Invalid message content');
        if (m.content.length > 50000) throw new Error('Message content too large');
        // Strip potential prompt injection markers
        const sanitized = m.content
            .replace(/<\|system\|>/gi, '')
            .replace(/<\|assistant\|>/gi, '')
            .replace(/IGNORE PREVIOUS INSTRUCTIONS/gi, '');
        return { role: m.role, content: sanitized };
    });
};

// ── Gemini Executor ───────────────────────────────────────────────────
const executeGemini = async (messages, responseFormat) => {
    if (!CONFIG.gemini.key) throw new Error("Missing Gemini Key");

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

    // Try each model in order
    for (const model of CONFIG.gemini.models) {
        try {
            const url = `${CONFIG.gemini.baseEndpoint}/${model}:generateContent?key=${CONFIG.gemini.key}`;
            const response = await axios.post(url, body, {
                headers: { "Content-Type": "application/json" },
                timeout: 30000
            });
            const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                console.log(`✅ Gemini (${model}) succeeded`);
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
    if (!CONFIG.mistral.key) throw new Error("Missing Mistral Key");

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
    console.log("✅ Mistral succeeded");
    return text;
};

// ── Main API Handler ──────────────────────────────────────────────────
export async function POST(request) {
    try {
        // ── Validate Content-Type
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
        }

        // ── Parse & Sanitize Input
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { messages: rawMessages, format } = body;

        let messages;
        try {
            messages = sanitizeMessages(rawMessages);
        } catch (e) {
            return NextResponse.json({ error: e.message }, { status: 400 });
        }

        const responseFormat = ['json_object', 'text'].includes(format) ? format : 'json_object';

        // ── Execute with Fallback Chain
        let content = null;

        try {
            content = await executeGemini(messages, responseFormat);
        } catch (geminiError) {
            console.warn("Gemini unavailable, falling back to Mistral:", geminiError.message);
            try {
                content = await executeMistral(messages, responseFormat);
            } catch (mistralError) {
                console.error("Both AI providers failed:", mistralError.message);
                return NextResponse.json(
                    { error: `AI Services unreachable. Gemini: ${geminiError.message}. Mistral: ${mistralError.message}` },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json({ success: true, content }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'X-Content-Type-Options': 'nosniff',
            }
        });

    } catch (error) {
        console.error("API Route Error:", error.message);
        return NextResponse.json(
            { error: 'Internal server error' },   // Never expose stack traces
            { status: 500 }
        );
    }
}

// Only allow POST
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
