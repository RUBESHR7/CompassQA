import { GoogleGenerativeAI } from "@google/generative-ai";

// The key found in test-rest.js
const API_KEY = "AIzaSyByNyfpPL_LwsKDJT7H1HCtFplmwJna2HI";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testOldKey() {
    console.log("🔑 Testing with Key: ...Jna2HI");
    const modelName = "gemini-1.5-flash";

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Attempting generation with ${modelName}...`);
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("✅ SUCCESS!");
        console.log(response.text());
    } catch (error) {
        console.log("❌ FAILED:");
        console.log(error.message);
    }
}

testOldKey();
