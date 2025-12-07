import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDCIvnH-ruTZxuluas_DVhDyFBZUHVhek4";
const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_CANDIDATES = [
    "gemini-1.5-flash",
    "gemini-2.5-flash"
];

const config = {
    temperature: 0.7,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};

async function testAppFlow() {
    console.log("🚀 Starting App Flow Simulation (Array Syntax)...");

    for (const modelName of MODEL_CANDIDATES) {
        try {
            console.log(`\n👉 Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: config
            });

            // EXACTLY matching aiService.js style: passing array of strings cause no images here
            const parts = ["Generate 1 test case for login in JSON."];

            const result = await model.generateContent(parts);
            const response = await result.response;
            console.log(`✅ SUCCESS with ${modelName}!`);
            console.log("Response Preview:", response.text().substring(0, 100));
            return;

        } catch (error) {
            console.log(`❌ FAILED ${modelName}`);
            console.log(`   Msg: ${error.message}`);
        }
    }
}

testAppFlow();
