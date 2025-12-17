import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Manually read .env to avoid dependency
const envPath = path.resolve(process.cwd(), ".env");
let apiKey = "";

try {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env file");
}

if (!apiKey) {
    console.error("No API KEY found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const candidates = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash-exp"
        ];

        console.log("Fetching Available Models List...");
        try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await resp.json();
            if (data.models) {
                console.log("Available Models:", data.models.map(m => m.name));
            } else {
                console.log("ListModels Error:", data);
            }
        } catch (fetchErr) {
            console.error("Failed to list models:", fetchErr);
        }

        console.log("Testing Model Availability...");

        for (const modelName of candidates) {
            try {
                const m = genAI.getGenerativeModel({ model: modelName });
                // Try a minimal generation to confirm access
                await m.generateContent("Hi");
                console.log(`[SUCCESS] ${modelName} is AVAILABLE.`);
            } catch (e) {
                if (e.message.includes("404") || e.message.includes("not found")) {
                    console.log(`[FAILED]  ${modelName} - Not Found (404)`);
                    console.log(`          Error Details: ${e.message}`);
                } else if (e.message.includes("429")) {
                    console.log(`[SUCCESS] ${modelName} - Exists but Rate Limited (429)`);
                } else {
                    console.log(`[ERROR]   ${modelName} - ${e.message}`);
                }
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}


listModels();
