import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDRRmfCYt23t_A978CIC7vSoJvvcSsiiyI";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testProductionLogic() {
    console.log("🚀 Testing with 5 Cases (Small Batch)...");
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
        }
    });

    try {
        const prompt = `Generate exactly 5 detailed test cases for: "Login". Return ONLY valid JSON.`;
        const result = await model.generateContent([prompt]);

        console.log("Response Object Keys:", Object.keys(result.response));

        try {
            const text = result.response.text();
            console.log(`Received ${text ? text.length : 0} chars.`);
            if (text) console.log("Sample:", text.substring(0, 100));
        } catch (err) {
            console.log("Error getting text():", err.message);
        }

        if (result.response.candidates && result.response.candidates.length > 0) {
            console.log("Finish Reason:", result.response.candidates[0].finishReason);
            console.log("Safety Ratings:", JSON.stringify(result.response.candidates[0].safetyRatings, null, 2));
        }

    } catch (e) {
        console.log("❌ CRITICAL FAILURE:", e.message);
    }
}

testProductionLogic();
