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
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("Missing API Key");
    }

    console.log("Using client-side generation");
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Switch to gemini-2.5-flash as it is at the top of the available list and may have better quotas
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });

    // Requesting ~30-40 test cases to ensure they fit within the 8192 output token limit.
    // 100 detailed test cases would exceed the limit (~10k+ tokens), causing JSON truncation errors.
    let prompt = `Generate a comprehensive set of test cases (aim for 30-40 high-quality scenarios) for this user story: "${userStory}"

Start test case IDs with "${testCaseId}" and increment sequentially.

Structure your response perfectly matches this JSON schema:
{
  "suggestedFilename": "descriptive_filename.xlsx",
  "testCases": [
    {
      "id": "string",
      "summary": "string",
      "description": "string",
      "preConditions": "string",
      "steps": [
        {
          "stepNumber": 1,
          "description": "string",
          "inputData": "string",
          "expectedOutcome": "string"
        }
      ],
      "label": "string",
      "priority": "string",
      "status": "string",
      "executionMinutes": "string",
      "caseFolder": "string",
      "testCategory": "string"
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

    // Implementing Retry with Exponential Backoff
    let retries = 3;
    let delay = 3000; // Start with 3 seconds

    while (retries >= 0) {
      try {
        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        console.log("Raw AI response length:", text.length);

        // Robust JSON extraction
        let jsonString = text;
        // Remove markdown code blocks if present
        jsonString = jsonString.replace(/```json\n?|```/g, '');

        // Find the first '{' and last '}'
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        } else {
          throw new Error("Invalid JSON structure in AI response");
        }

        return JSON.parse(jsonString);

      } catch (error) {
        // Handle 503 (Service Unavailable) and 429 (Too Many Requests)
        if (error.status === 503 || error.status === 429 || error.message.includes("429") || error.message.includes("503")) {
          if (retries === 0) {
            console.error("Max retries reached.");
            throw new Error(`Service busy or rate limit reached. Please wait a minute and try again. (${error.message})`);
          }
          console.warn(`Attempt failed (Rate Limit/Service Busy). Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Double delay for next retry
          retries--;
        } else {
          // If it's another error (e.g., API key, invalid request), throw immediately
          throw error;
        }
      }
    }

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
    if (!API_KEY) {
      throw new Error("Missing API Key");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Use same model for consistency
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
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

    let jsonString = text.replace(/```json\n?|```/g, "");
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

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
