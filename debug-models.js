import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDRRmfCYt23t_A978CIC7vSoJvvcSsiiyI";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // For some reason the SDK might not expose listModels directly on genAI instance easily in all versions, 
        // but let's try to just use a known working model like 'gemini-pro' to test connection first,
        // or use the model.
        // Actually, the error message suggested calling ListModels. 
        // The SDK doesn't always have a direct listModels method exposed in the main class in all versions.
        // Let's try to just instantiate a few and see which one doesn't throw immediately or if we can make a simple call.

        // Better yet, let's try to generate content with 'gemini-pro' and see if that works.
        // If 'gemini-1.5-flash' is failing, maybe the account doesn't have access to it?

        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

        for (const modelName of modelsToTry) {
            console.log(`Trying model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`SUCCESS: ${modelName} worked! Response: ${response.text()}`);
                return; // Found one that works
            } catch (error) {
                console.log(`FAILED: ${modelName} - ${error.message}`);
            }
        }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

listModels();
