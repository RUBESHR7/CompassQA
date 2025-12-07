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
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Internal function to generate a small batch of test cases
const generateBatch = async (model, userStory, startId, count, screenshots, batchIndex) => {
  const prompt = `Generate exactly ${count} detailed test cases for this user story: "${userStory}"

  Start test case IDs with "${startId}" and increment sequentially (e.g., if start is TC_001, generate TC_001 to TC_020).

  Return ONLY valid JSON. Structure:
  {
    "testCases": [
      {
        "id": "${startId}",
        "summary": "brief summary",
        "description": "detailed description including all input data",
        "preConditions": "prerequisites",
        "steps": [
          {
            "stepNumber": 1,
            "description": "action",
            "inputData": "",
            "expectedOutcome": "expected result"
          }
        ],
        "label": "Functional/UI/Security/Performance",
        "priority": "High/Medium/Low",
        "status": "Draft",
        "executionMinutes": "5",
        "caseFolder": "module name",
        "testCategory": "Regression/Smoke/Sanity"
      }
    ]
  }

  Requirements:
  - Generate a set of unique test cases that are distinct from other potential scenarios.
  - Since this is batch ${batchIndex + 1} of 5 (Total aim: 100 cases), please ensure this specific batch explores ${batchIndex === 0 ? "Core Positive Flows and Critical Paths" : batchIndex === 1 ? "Negative Scenarios and Validation Errors" : batchIndex === 2 ? "Edge Cases, Boundaries, and Limits" : batchIndex === 3 ? "Advanced/Complex Workflows and Security" : "Performance, Usability, and Cross-Platform Scenarios"} in depth.
  - However, you are FREE to include any relevant test case that fits the user story.
  - Test steps should be detailed and logical (no fixed step count).
  - Include realistic input data where applicable in the description or expected outcome.`;

  const parts = [prompt];

  if (screenshots && screenshots.length > 0) {
    parts.push("\n\nRefer to the attached screenshots for UI context:");
    for (const file of screenshots) {
      const base64Data = await fileToGenerativePart(file);
      parts.push(base64Data);
    }
  }

  // Retry logic for this specific batch
  let retries = 3;
  let delay = 2000 + (batchIndex * 1000); // Stagger retries to avoid thundering herd

  while (retries >= 0) {
    try {
      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      let jsonString = text.replace(/```json\n?|```/g, '');
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonString);
        return parsed.testCases || [];
      } else {
        throw new Error("Invalid JSON structure");
      }
    } catch (error) {
      if (retries === 0) {
        console.warn(`Batch ${batchIndex} failed after retries:`, error);
        return []; // Return empty for this batch instead of failing everything
      }
      if (error.status === 429 || error.message.includes("429") || error.message.includes("503")) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        retries--;
      } else {
        // Non-transient error, maybe malformed JSON
        console.warn(`Batch ${batchIndex} error:`, error);
        retries--; // Try again, maybe different generation will parse better
      }
    }
  }
  return [];
};

export const generateTestCases = async (userStory, testCaseId, screenshots) => {
  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) throw new Error("Missing API Key");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });

    console.log("Starting parallel batch generation...");

    // We want ~100 cases. split into 5 batches of 20
    const batches = 5;
    const casesPerBatch = 20;
    const promises = [];

    // Parse ID to handle incrementing (e.g. TC_001 -> TC_021)
    const idPrefix = testCaseId.match(/^[a-zA-Z_-]+/)?.[0] || "TC_";
    const idNumStr = testCaseId.match(/\d+$/)?.[0] || "1";
    const startNum = parseInt(idNumStr, 10);
    const idLength = idNumStr.length;

    for (let i = 0; i < batches; i++) {
      const batchStartNum = startNum + (i * casesPerBatch);
      const batchStartId = `${idPrefix}${String(batchStartNum).padStart(idLength, '0')}`;

      promises.push(generateBatch(model, userStory, batchStartId, casesPerBatch, screenshots, i));
    }

    // Wait for all batches
    const results = await Promise.all(promises);

    // Combine results
    const allTestCases = results.flat();

    if (allTestCases.length === 0) {
      throw new Error("Failed to generate any test cases. Please try again.");
    }

    // Sort by ID to ensure correct order
    allTestCases.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

    return {
      suggestedFilename: "Generated_Test_Cases.xlsx",
      testCases: allTestCases
    };

  } catch (error) {
    console.error("Error generating test cases:", error);
    if (error.message.includes("API key not valid")) {
      throw new Error("Invalid API Key. Please check your configuration.");
    }
    throw error;
  }
};

export const refineTestCases = async (currentTestCases, userInstructions) => {
  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) throw new Error("Missing API Key");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });

    // For refinement, we can't easily batch without complex logic. 
    // We'll send a simplified version if list is huge, or just the top 20-30 for context if needed.
    // For now, sending all but expecting potential truncation if > 50. 
    // Optimization: Only send summaries if list is long? 
    // Let's rely on 2.5-flash's large context window (1M tokens) handling input fine.
    // The OUTPUT is the bottleneck.

    const prompt = `
      You are "Compass AI".
      User Input: "${userInstructions}"
      
      Current Test Cases (JSON):
      ${JSON.stringify(currentTestCases)}
      
      Update the test cases based on the instructions.
      Return JSON: { "message": "string", "suggestedFilename": "string", "testCases": [] }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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
