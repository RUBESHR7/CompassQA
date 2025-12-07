import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDCIvnH-ruTZxuluas_DVhDyFBZUHVhek4";
const genAI = new GoogleGenerativeAI(API_KEY);

async function findAnyWorkingModel() {
    const candidates = [
        "gemini-2.0-flash-exp",
        "gemini-exp-1114",
        "gemini-exp-1121",
        "learnlm-1.5-pro-experimental",
        "gemini-1.5-pro-002"
    ];

    console.log("Searching for ANY working model...");

    for (const m of candidates) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Test");
            console.log(`✅ FOUND ONE: ${m}`);
            return; // Stop at first success
        } catch (error) {
            console.log(`❌ ${m} FAILED: ${error.message.substring(0, 50)}...`);
        }
    }
    console.log("💀 No working models found.");
}

findAnyWorkingModel();
