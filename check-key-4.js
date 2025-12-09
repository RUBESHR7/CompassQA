import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDRRmfCYt23t_A978CIC7vSoJvvcSsiiyI";
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
