import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDRRmfCYt23t_A978CIC7vSoJvvcSsiiyI";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Try to init explicitly
        console.log("Checking gemini-1.5-flash access...");
        try {
            await model.generateContent("Hello");
            console.log("✅ gemini-1.5-flash WORKED");
        } catch (e) {
            console.log("❌ gemini-1.5-flash FAILED: " + e.message);
        }

        console.log("\nListing all available models...");
        // There isn't a direct 'listModels' in the node SDK easily exposed, 
        // but we can try to infer or use the REST API if needed.
        // Actually, looking at previous 'list-models.js' usage, maybe it used a different method?
        // Let's just try a few known ones.

        const candidates = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-pro"];

        for (const m of candidates) {
            if (m === "gemini-1.5-flash") continue; // already tested
            console.log(`Testing ${m}...`);
            try {
                const mod = genAI.getGenerativeModel({ model: m });
                await mod.generateContent("Hi");
                console.log(`✅ ${m} AVAILABLE`);
            } catch (e) {
                console.log(`❌ ${m} FAILED: ${e.message}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
