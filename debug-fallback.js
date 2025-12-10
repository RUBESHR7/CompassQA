import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA";
const genAI = new GoogleGenerativeAI(API_KEY);

const CANDIDATES = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",   // Specific version
    "gemini-1.5-flash-002",   // Specific version
    "gemini-1.5-flash-8b",    // Lite version
    "gemini-1.5-pro",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro-002",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp",   // Experimental
    "gemini-2.5-flash"
];

async function findWorkingModel() {
    console.log("🔍 Starting Exhaustive Model Search...");

    for (const modelName of CANDIDATES) {
        try {
            process.stdout.write(`Testing ${modelName.padEnd(25)} ... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const response = await result.response;
            console.log(`✅ WORKS!`);
        } catch (error) {
            if (error.message.includes("404")) console.log("❌ 404 (Not Found)");
            else if (error.message.includes("429")) console.log("⚠️ 429 (Quota Exceeded)");
            else if (error.message.includes("403")) console.log("🚫 403 (Permission)");
            else console.log(`❌ Error: ${error.message.substring(0, 50)}...`);
        }
    }
}

findWorkingModel();
