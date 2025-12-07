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

// Fallback key if .env is missing/blocked
const FALLBACK_KEY = "AIzaSyDCIvnH-ruTZxuluas_DVhDyFBZUHVhek4";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || FALLBACK_KEY;

// Model Priority List
const MODEL_CANDIDATES = [
  "gemini-1.5-flash",        // Primary
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-002",
  "gemini-2.5-flash",        // High perf
  "gemini-2.0-flash-exp",    // Experimental
  "gemini-exp-1114",         // Snapshot
  "gemini-exp-1121",         // Snapshot
  "gemini-exp-1206",         // Snapshot
  "gemini-1.5-pro",
  "learnlm-1.5-pro-experimental"
];

// Mock Data for Safe Mode
const MOCK_TEST_CASE = {
  suggestedFilename: "Safe_Mode_Test_Cases.xlsx",
  testCases: [
    {
      id: "TC_001_MOCK",
      summary: "Safe Mode: Login Verification (API Quota Exceeded)",
      description: "This is a generated test case because the Google API Quota is currently exhausted (Limit: 20/day). Please try again tomorrow for AI generation.",
      preConditions: "Application is accessible",
      steps: [
        {
          stepNumber: 1,
          description: "Navigate to the Login Page",
          inputData: "",
          expectedOutcome: "Login page loads successfully"
        },
        {
          stepNumber: 2,
          description: "Enter valid credentials",
          inputData: "",
          expectedOutcome: "Credentials accepted"
        }
      ],
      label: "Functional",
      priority: "High",
      status: "Draft",
      executionMinutes: "5",
      caseFolder: "Auth",
      testCategory: "Smoke"
    }
  ]
};

// Helper to try generation with fallback models
async function generateWithFallback(genAI, parts, config) {
  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      // console.log(`Attempting generation with model: ${modelName}`); 
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: config
      });

      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text(); // Success!

    } catch (error) {
      console.warn(`Model ${modelName} failed: ${error.message}`);
      lastError = error;
    }
  }
  throw new Error(`All models failed. Last error: ${lastError?.message}`);
}

// Internal function to generate a small batch of test cases
const generateBatch = async (genAI, userStory, startId, count, screenshots, batchIndex) => {
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
  - Cover positive, negative, edge cases, and security scenarios.
  - 5-7 steps per test case.
  - inputData must be empty string "".
  - Include all data in description field.`;

  const parts = [prompt];

  if (screenshots && screenshots.length > 0) {
    parts.push("\n\nRefer to the attached screenshots for UI context:");
    for (const file of screenshots) {
      const base64Data = await fileToGenerativePart(file);
      parts.push(base64Data);
    }
  }

  // Retry logic for this specific batch (Model fallback is inside)
  let retries = 1;
  let delay = 2000;

  while (retries >= 0) {
    try {
      const text = await generateWithFallback(genAI, parts, {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      });

      let jsonString = text.replace(/```json\n?|```/g, '');
      const firstBrace = jsonString.indexOf('{');
      const firstBracket = jsonString.indexOf('[');
      const lastBrace = jsonString.lastIndexOf('}');
      const lastBracket = jsonString.lastIndexOf(']');

      let startIdx = -1;
      let endIdx = -1;

      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        endIdx = lastBrace;
      } else if (firstBracket !== -1) {
        startIdx = firstBracket;
        endIdx = lastBracket;
      }

      if (startIdx !== -1 && endIdx !== -1) {
        jsonString = jsonString.substring(startIdx, endIdx + 1);
        const parsed = JSON.parse(jsonString);

        let cases = [];
        if (Array.isArray(parsed)) {
          cases = parsed;
        } else if (parsed.testCases && Array.isArray(parsed.testCases)) {
          cases = parsed.testCases;
        } else if (parsed.test_cases && Array.isArray(parsed.test_cases)) {
          cases = parsed.test_cases;
        }

        return cases.filter(c => c && typeof c === 'object');
      } else {
        throw new Error("Invalid JSON structure received from AI");
      }
    } catch (error) {
      console.warn(`Batch ${batchIndex} attempt failed:`, error.message);
      if (retries === 0) {
        throw error;
      }
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
      retries--;
    }
  }
  throw new Error(`Batch ${batchIndex} failed after retries`);
};

export const generateTestCases = async (userStory, testCaseId, screenshots) => {
  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || FALLBACK_KEY;
    if (!API_KEY) throw new Error("Missing API Key");

    const genAI = new GoogleGenerativeAI(API_KEY);

    console.log("Starting batch generation (Safe Mode Enabled)...");

    // REDUCED TO 1 BATCH to save time/resources when we know it might fail
    const batches = 5;
    const casesPerBatch = 20;
    const allTestCases = [];
    const errors = [];

    // Parse ID
    const idPrefix = testCaseId.match(/^[a-zA-Z_-]+/)?.[0] || "TC_";
    const idNumStr = testCaseId.match(/\d+$/)?.[0] || "1";
    const startNum = parseInt(idNumStr, 10);
    const idLength = idNumStr.length;

    // Execute SEQUENTIALLY
    let usedMock = false;

    for (let i = 0; i < batches; i++) {
      const batchStartNum = startNum + (i * casesPerBatch);
      const batchStartId = `${idPrefix}${String(batchStartNum).padStart(idLength, '0')}`;

      try {
        console.log(`Generating Batch ${i + 1}/${batches}...`);
        const batchCases = await generateBatch(genAI, userStory, batchStartId, casesPerBatch, screenshots, i);
        allTestCases.push(...batchCases);

        if (i < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 4000));
        }

      } catch (err) {
        console.error(`Batch ${i + 1} failed:`, err);
        errors.push(`Batch ${i + 1}: ${err.message}`);

        // ACTIVATE SAFE MODE MOCK if critical failure
        if (!usedMock) {
          console.warn("Returning MOCK data due to API failure.");
          const mock = JSON.parse(JSON.stringify(MOCK_TEST_CASE.testCases));
          mock[0].id = batchStartId; // Update mock ID
          allTestCases.push(...mock);
          usedMock = true; // Only add mock once per failure loop
          break; // Stop trying other batches if we are mocked
        }
      }
    }

    if (allTestCases.length === 0) {
      // Fallback if everything failed immediately
      return MOCK_TEST_CASE;
    }

    // Sort by ID
    allTestCases.sort((a, b) => {
      if (!a.id || !b.id) return 0;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });

    return {
      suggestedFilename: "Generated_Test_Cases.xlsx",
      testCases: allTestCases
    };

  } catch (error) {
    console.error("Error generating test cases:", error);
    if (error.message.includes("API key not valid")) {
      throw new Error("Invalid API Key. Please check your configuration.");
    }
    // Return mock even on top level error
    return MOCK_TEST_CASE;
  }
};

export const refineTestCases = async (currentTestCases, userInstructions) => {
  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || FALLBACK_KEY;
    if (!API_KEY) throw new Error("Missing API Key");

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Also use fallback for refinement
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
    // Throw error here as mock refinement is harder and mostly UI
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
