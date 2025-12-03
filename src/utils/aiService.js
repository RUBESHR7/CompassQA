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

export const generateTestCases = async (userStory, screenshots) => {
  try {
    // In development, use client-side SDK directly
    if (isDevelopment && API_KEY) {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

      let prompt = `
        You are an expert QA Automation Engineer. 
        Analyze the following User Story and generate a comprehensive set of test cases covering all scenarios (positive, negative, edge cases).
        Do not limit the number of test cases; generate as many as necessary to fully cover the user story.
        
        User Story:
        "${userStory}"
        
        Output Format:
        Provide a JSON object with two fields:
        1. "suggestedFilename": "A concise, professional filename based on the User Story (e.g., 'Login_Feature_TestCases.xlsx')"
        2. "testCases": A JSON array of objects with the following structure:
        [
          {
            "id": "TC_XXX",
            "summary": "Concise summary of the test case",
            "description": "Detailed description including the purpose",
            "preConditions": "Prerequisites required",
            "steps": [
              {
                "stepNumber": 1,
                "description": "Detailed action to perform (include all data requirements here)",
                "inputData": "", 
                "expectedOutcome": "Expected result of the step"
              }
            ],
            "label": "Functional/UI/Security/Performance",
            "priority": "High/Medium/Low",
            "status": "Draft",
            "executionMinutes": "Estimated time in minutes",
            "caseFolder": "Module/Feature Name",
            "testCategory": "Regression/Smoke/Sanity"
          }
        ]

        Constraints:
        - The output must be valid JSON only. Do not include markdown code blocks.
        - "inputData" field MUST BE EMPTY string "". All specific data (e.g., "Enter 'user@example.com'") must be included in the "description" field.
        - Ensure test cases cover positive, negative, and edge cases.
        - Test steps should be detailed (5-10 steps per case).
        - Use the provided User Story to derive realistic input data and expected outcomes.
      `;

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
    }

    // In production, use Netlify Functions
    let processedScreenshots = [];
    if (screenshots && screenshots.length > 0) {
      processedScreenshots = await Promise.all(screenshots.map(file => fileToBase64(file)));
    }

    const response = await fetch('/.netlify/functions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userStory,
        screenshots: processedScreenshots
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error generating test cases:", error);
    throw error;
  }
};

export const refineTestCases = async (currentTestCases, userInstructions) => {
  try {
    // In development, use client-side SDK directly
    if (isDevelopment && API_KEY) {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

      const prompt = `
        You are an expert QA Automation Engineer.
        Refine the following test cases based on the user's instructions.
        
        User Instructions: "${userInstructions}"
        
        Current Test Cases (JSON):
        ${JSON.stringify(currentTestCases)}
        
        Output Format:
        Provide a JSON object with two fields:
        1. "suggestedFilename": "Updated filename if necessary, or keep the same"
        2. "testCases": The updated JSON array of test case objects.
        
        Constraints:
        - Return ONLY valid JSON.
        - Maintain the same structure as the input.
        - Apply the user's instructions accurately (e.g., add new cases, modify steps, change priorities).
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "");
      return JSON.parse(jsonString);
    }

    // In production, use Netlify Functions
    const response = await fetch('/.netlify/functions/refine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testCases: currentTestCases,
        instructions: userInstructions
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
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
