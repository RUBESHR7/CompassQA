import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testFourthKey() {
    console.log("Testing with Fourth Key: ...VWw0");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("✅ gemini-2.5-flash SUCCESS!");
    } catch (error) {
        console.log(`❌ gemini-2.5-flash FAILED: ${error.message}`);
    }
}

testFourthKey();
