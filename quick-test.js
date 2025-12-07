// Quick test of the working API key
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCM08fMV2DfStVTTLAdluxyb6T0P51e_f4";

async function quickTest() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = "Say 'Hello from Gemini 2.5 Flash!' in one sentence.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ SUCCESS! Gemini 2.5 Flash is working!");
        console.log("Response:", text);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

quickTest();
