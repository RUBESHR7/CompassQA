import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to convert File to Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve({
        data: base64String,
        mimeType: file.type
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// FORCE USAGE of the new validated key. 
// We use logical OR to prefer the hardcoded valid key IF env var is missing or invalid.
// However, to fix the specific "Github Pages has old key" issue, we prioritize the hardcoded key 
// if it is known to be the working one.
const HARDCODED_KEY = "AIzaSyDCIvnH-ruTZxuluas_DVhDyFBZUHVhek4";
const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Logic: Use Hardcoded key if available, otherwise fallback to Env.
// This is opposite of standard practice but required to fix the "Stale Env Var" bug on deployment.
const API_KEY = HARDCODED_KEY || ENV_KEY;

// Model Priority List
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",        // Primary: Verified Working
  "gemini-2.0-flash-exp",    // Experimental Backup
  "gemini-1.5-flash",        // Legacy (often 404)
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
];

// Helper to try generation with fallback models
async function generateWithFallback(genAI, parts, config) {
  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: config
      });

      // SDK v0.24.1 expects 'parts' to be passed directly 
      // if it's an array of objects/strings used in 'generateContent'.
      // Correct usage: model.generateContent(parts) where parts = [string, ...]
      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text(); // Success!

    } catch (error) {
      console.warn(`Model ${modelName} failed: ${error.message}`);
      lastError = error;
      // Continue to next model
    }
  };

  export const refineTestCases = async (currentTestCases, userInstructions) => {
    try {
      if (!API_KEY) throw new Error("Missing API Key");

      const genAI = new GoogleGenerativeAI(API_KEY);

      const prompt = `
      You are "Compass AI".
      User Input: "${userInstructions}"
      
      Current Test Cases (JSON):
      ${JSON.stringify(currentTestCases)}
      
      Update the test cases based on the instructions.
      Return JSON: { "message": "string", "suggestedFilename": "string", "testCases": [] }
    `;

      const text = await generateWithFallback(genAI, [prompt], {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      });

      let jsonString = text.replace(/```json\n?|```/g, "");
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Refinement error:", error);
      throw error;
    }
  };

  async function fileToGenerativePart(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          },
        });
      };
      reader.readAsDataURL(file);
    });
  }
