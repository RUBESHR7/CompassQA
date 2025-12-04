import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyC9bw21bwskYkhFG9CgW3tC5I8XH59oRac";

async function testAPI() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Try with explicit API version
        const model = genAI.getGenerativeModel({
            model: "models/gemini-pro",
        });

        console.log("Testing with models/gemini-pro...");
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log(`✅ Success!`);
        console.log(`Response: ${response.text()}`);
    } catch (error) {
        console.error("❌ Failed:", error.message);
        console.log("\n📋 Please check:");
        console.log("1. Go to: https://makersuite.google.com/app/apikey");
        console.log("2. Make sure 'Generative Language API' is enabled");
        console.log("3. Try creating a new API key");
        console.log("4. Test it in Google AI Studio first");
    }
}

testAPI();
