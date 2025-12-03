import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { userStory, screenshots } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error: API Key missing' })
            };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
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

        // Handle screenshots if provided
        if (screenshots && screenshots.length > 0) {
            parts.push("\n\nRefer to the attached screenshots for UI context:");
            for (const screenshot of screenshots) {
                parts.push({
                    inlineData: {
                        data: screenshot.data,
                        mimeType: screenshot.mimeType
                    }
                });
            }
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "");
        const data = JSON.parse(jsonString);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("API Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || 'Internal Server Error' })
        };
    }
};
