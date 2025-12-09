import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDRRmfCYt23t_A978CIC7vSoJvvcSsiiyI";
const genAI = new GoogleGenerativeAI(API_KEY);

const generateBatch = async (batchIndex) => {
    console.log(`[${batchIndex}] Starting...`);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    try {
        // Reduced payload to simulate app but focused on volume
        const result = await model.generateContent(`Generate 15 test cases for Login. Return valid JSON only.`);
        const text = result.response.text();
        console.log(`[${batchIndex}] ✅ Success (${text.length} chars)`);
        return true;
    } catch (e) {
        console.log(`[${batchIndex}] ❌ Failed: ${e.message}`);
        return false;
    }
};

async function stressTest() {
    console.log("🚀 Starting Parallel Stress Test (5 batches)...");
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(generateBatch(i + 1));
    }
    await Promise.all(promises);
    console.log("🏁 Done.");
}

stressTest();
