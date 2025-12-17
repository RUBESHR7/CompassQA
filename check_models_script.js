import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

let apiKey = ""; // Will be read from .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
            console.log("Found API Key in .env");
        }
    }
} catch (e) {
    console.error("Could not read .env:", e.message);
}

async function listModels() {
    if (!apiKey) {
        console.error("API Key is missing!");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // There isn't a direct "listModels" on the client instance in some SDK versions, 
        // but let's try to infer or just try a few known ones.
        // Actually, the error message suggested calling ListModels.
        // In the Node SDK, it might be under a different manager or not directly exposed easily without a specific call.
        // Let's try to just test a few common ones.

        // Correct way in some SDK versions:
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // But we want to list. 

        // Since listing might be complex without the right import, let's just TEST 3 common candidates.

        const candidates = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
            "gemini-1.5-pro-001",
            "gemini-1.5-pro-002",
            "gemini-exp-1206",
            "gemini-exp-1121",
            "gemini-exp-1114",
            "gemini-1.0-pro",
            "gemini-pro",
            "text-embedding-004"
        ];

        const logStream = fs.createWriteStream('model_status.txt');
        const log = (msg) => {
            console.log(msg);
            logStream.write(msg + '\n');
        }

        log("Testing models...");

        for (const modelName of candidates) {
            try {
                log(`Testing ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                const response = await result.response;
                log(`✅ SUCCESS: ${modelName} worked!`);
                break;
            } catch (e) {
                log(`❌ FAILED: ${modelName} - ${e.message.split('\n')[0]}`);
            }
        }
        logStream.end();

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
