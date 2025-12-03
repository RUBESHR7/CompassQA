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
        const { testCases, instructions } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error: API Key missing' })
            };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
      You are an expert QA Automation Engineer.
      Refine the following test cases based on the user's instructions.
      
      User Instructions: "${instructions}"
      
      Current Test Cases (JSON):
      ${JSON.stringify(testCases)}
      
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
