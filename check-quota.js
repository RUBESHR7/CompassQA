import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA";
const genAI = new GoogleGenerativeAI(API_KEY);

async function checkQuota() {
    console.log("Checking NEW Key Quota...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Test");
        console.log("✅ Key is ALIVE and has quota.");
    } catch (error) {
        console.log("❌ FAILED:");
        console.log(error.message);
    }
}

checkQuota();
