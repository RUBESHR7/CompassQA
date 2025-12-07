import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCM08fMV2DfStVTTLAdluxyb6T0P51e_f4"; // Hardcoded for debugging

async function testGeneration() {
    console.log("Initializing Gemini 2.5 Flash...");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
        }
    });

    const prompt = `Generate exactly 5 detailed test cases for this user story: "As a user, I want to login with email and password."

  Start test case IDs with "TC_001" and increment sequentially.

  Return ONLY valid JSON. Structure:
  {
    "testCases": [
      {
        "id": "TC_001",
        "summary": "brief summary",
        "steps": []
      }
    ]
  }`;

    console.log("Sending prompt...");
    try {
        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const text = response.text();
        console.log("\n✅ Success! Response preview:");
        console.log(text.substring(0, 500));
        try {
            JSON.parse(text);
            console.log("✅ Valid JSON");
        } catch (e) {
            console.error("❌ Invalid JSON:", e.message);
        }
    } catch (error) {
        console.error("\n❌ Failure:");
        console.error(error);
        if (error.response) {
            console.error("Response:", error.response);
        }
    }
}

testGeneration();
