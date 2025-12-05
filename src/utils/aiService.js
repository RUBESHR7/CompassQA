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

export const generateTestCases = async (userStory, testCaseId, screenshots) => {
  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyByNyfpPL_LwsKDJT7H1HCtFplmwJna2HI";
    if (!API_KEY) {
      throw new Error("Missing API Key");
    }

    console.log("Using client-side generation");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });

    let prompt = `Generate test cases for this user story: "${userStory}"

Start test case IDs with "${testCaseId}" and increment (${testCaseId}, ${testCaseId.replace(/\d+$/, m => String(Number(m) + 1))}, etc.).

Return ONLY valid JSON (no markdown):
{
  "suggestedFilename": "descriptive_filename.xlsx",
  "testCases": [
    {
      "id": "${testCaseId}",
      "summary": "brief summary",
      "description": "detailed description",
      "preConditions": "prerequisites",
      "steps": [
        {
          "stepNumber": 1,
          "description": "action with all data (e.g., Enter 'user@test.com')",
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
- Cover positive, negative, edge cases
- 5-7 steps per test case
- inputData must be empty string ""
- Include all data in description field`;

    const parts = [prompt];

    if (screenshots && screenshots.length > 0) {
      parts.push("\n\nRefer to the attached screenshots for UI context:");
      for (const file of screenshots) {
        const base64Data = await fileToGenerativePart(file);
        parts.push(base64Data);
      }
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "");
    return JSON.parse(jsonString);

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
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyByNyfpPL_LwsKDJT7H1HCtFplmwJna2HI";
    if (!API_KEY) {
      throw new Error("Missing API Key");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `
      You are "Compass AI", an empathetic and expert QA Automation Engineer.
      
      Your Persona:
      - Name: Compass AI
      - Tone: Professional, warm, empathetic, and helpful.
      - Capabilities: You can refine test cases AND engage in friendly conversation.
      - Responses: 
        - If the user says "hi", "hello", etc., respond warmly as Compass AI.
        - If the user says "thank you", respond with "You're welcome! Happy to help."
        - If the user expresses frustration or emotion, respond with empathy and understanding before offering technical help.
        - If the user asks to modify test cases, perform the modification with precision.

      User Input: "${userInstructions}"
      
      Current Test Cases (JSON):
      ${JSON.stringify(currentTestCases)}
      
      Output Format:
      Provide a JSON object with three fields:
      1. "message": "Your conversational response to the user. If updating test cases, explain what you did. If just chatting, be friendly."
      2. "suggestedFilename": "Updated filename if necessary, or keep the same"
      3. "testCases": The updated JSON array of test case objects. IMPORTANT: If NO changes are needed (e.g., just a greeting or question), return null. Do NOT re-generate the full array unless you are modifying it.
      
      Constraints:
      - Return ONLY valid JSON.
      - Maintain the same structure as the input for test cases.
      - Always provide a "message" field.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "");
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error refining test cases:", error);
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
