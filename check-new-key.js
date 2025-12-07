import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDCIvnH-ruTZxuluas_DVhDyFBZUHVhek4";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testNewKeyVariants() {
    console.log("Testing with NEW Key: ...ZUHVhek4");

    const candidates = ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-latest"];

    for (const m of candidates) {
        try {
            console.log(`Attempting ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("Hello!");
            console.log(`✅ ${m} SUCCESS!`);
        } catch (error) {
            console.log(`❌ ${m} FAILED: ${error.message.substring(0, 100)}...`);
        }
    }
}

testNewKeyVariants();
