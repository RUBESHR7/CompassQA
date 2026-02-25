import { NextResponse } from 'next/server';
import axios from 'axios';

// AI Configuration
const CONFIG = {
    mistral: {
        key: process.env.NEXT_PUBLIC_MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY,
        endpoint: 'https://api.mistral.ai/v1/chat/completions',
        model: 'mistral-small-latest'
    },
    gemini: {
        key: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        model: 'gemini-2.0-flash-exp'
    }
};

const executeGemini = async (messages, responseFormat) => {
    if (!CONFIG.gemini.key) throw new Error("Missing Gemini Key");
    const url = `${CONFIG.gemini.endpoint}?key=${CONFIG.gemini.key}`;

    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const body = {
        contents: userMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        })),
        generationConfig: {
            temperature: 0.2,
            responseMimeType: responseFormat === "json_object" ? "application/json" : "text/plain"
        }
    };

    if (systemMessage) {
        body.systemInstruction = { parts: [{ text: systemMessage.content }] };
    }

    const response = await axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000 // 10s timeout to detect block quickly
    });
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const executeMistral = async (messages, responseFormat) => {
    if (!CONFIG.mistral.key) throw new Error("Missing Mistral Key");

    const body = {
        model: CONFIG.mistral.model,
        messages: messages,
        response_format: { type: responseFormat },
        temperature: 0.2
    };

    const response = await axios.post(CONFIG.mistral.endpoint, body, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CONFIG.mistral.key}`
        },
        timeout: 10000
    });
    return response.data.choices?.[0]?.message?.content || "";
};

export async function POST(request) {
    try {
        const { messages, format } = await request.json();

        let content = null;
        let lastError = null;

        // Try Gemini First (Usually more accessible in corporate networks)
        try {
            console.log("Attempting Gemini...");
            content = await executeGemini(messages, format || "json_object");
        } catch (error) {
            console.error("Gemini failed/blocked, falling back to Mistral:", error.message);
            lastError = error;

            // Fallback to Mistral
            try {
                console.log("Attempting Mistral...");
                content = await executeMistral(messages, format || "json_object");
            } catch (mistralError) {
                console.error("Mistral also failed:", mistralError.message);
                throw new Error(`AI Services are currently unreachable on this network. Gemini: ${error.message}, Mistral: ${mistralError.message}`);
            }
        }

        return NextResponse.json({ success: true, content });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
