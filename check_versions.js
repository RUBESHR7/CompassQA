import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
let apiKey = "";
try {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (e) { }

if (!apiKey) { console.error("No API KEY"); process.exit(1); }

async function testConfig() {
    // Test both models on both API versions if possible via SDK
    // The SDK might not expose version switching easily in constructor, 
    // but let's try standard 'gemini-1.5-flash' again.

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = ["gemini-1.5-flash", "gemini-pro"];

    console.log("Retrying Standard Models...");

    for (const mName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: mName });
            await model.generateContent("Test");
            console.log(`[SUCCESS] ${mName} works via SDK default.`);
        } catch (e) {
            console.log(`[FAIL] ${mName}: ${e.message}`);
        }
    }
}

testConfig();
