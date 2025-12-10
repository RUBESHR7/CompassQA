import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testAlternatives() {
    const candidates = [
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-exp-1206"
    ];

    console.log("Checking High-Volume Alternatives...");

    for (const m of candidates) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${m} SUCCESS!`);
        } catch (error) {
            console.log(`❌ ${m} FAILED: ${error.message.substring(0, 80)}...`);
        }
    }
}

testAlternatives();
