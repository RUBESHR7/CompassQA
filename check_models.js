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
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash-002",
            "gemini-1.5-pro-002",
            "gemini-exp-1206"
        ];

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
