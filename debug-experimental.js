import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA";
const genAI = new GoogleGenerativeAI(API_KEY);

const EXPERIMENTAL_CANDIDATES = [
    "gemini-exp-1114",
    "gemini-exp-1121",
    "gemini-exp-1206",
    "learnlm-1.5-pro-experimental",
    "gemini-1.5-pro-002",
    "gemini-1.5-flash-8b"
];

async function findWorkingExperimental() {
    console.log("🔍 Searching Experimental Models...");

    for (const modelName of EXPERIMENTAL_CANDIDATES) {
        try {
            process.stdout.write(`Testing ${modelName.padEnd(30)} ... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const response = await result.response;
            console.log(`✅ WORKS! (Response: ${response.text().trim()})`);
        } catch (error) {
            if (error.message.includes("404")) console.log("❌ 404 (Not Found)");
            else if (error.message.includes("429")) console.log("⚠️ 429 (Quota Exceeded)");
            else console.log(`❌ Error: ${error.message.substring(0, 50)}...`);
        }
    }
}

findWorkingExperimental();
