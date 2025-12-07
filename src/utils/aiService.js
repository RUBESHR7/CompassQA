import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateTestCases = async (userStory, testCaseId, screenshots) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is required");
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const jsonString = jsonMatch[0];

    const parsedData = JSON.parse(jsonString);

    // Handle both old (array) and new (object) formats for backward compatibility if needed, 
    // but strictly we expect object now.
    const testCasesArray = Array.isArray(parsedData) ? parsedData : parsedData.testCases;
    const filename = parsedData.suggestedFilename || "TestCases.xlsx";

    // Post-process to ensure IDs match the requested format
    const processedCases = testCasesArray.map((tc, index) => {
      let newId;
      if (testCaseId) {
        const match = testCaseId.match(/^(.*?)(\d+)$/);
        if (match) {
          const prefix = match[1];
          const numStr = match[2];
          const startNum = parseInt(numStr, 10);
          const width = numStr.length;
          const nextNum = startNum + index;
          newId = `${prefix}${String(nextNum).padStart(width, '0')}`;
        } else {
          // If testCaseId has no number at the end, append _001, _002 etc.
          newId = `${testCaseId}_${String(index + 1).padStart(3, '0')}`;
        }
      } else {
        newId = `TC_${String(index + 1).padStart(3, '0')}`;
      }

      return {
        ...tc,
        id: newId
      };
    });

    return { testCases: processedCases, suggestedFilename: filename };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate test cases.");
  }
};

export const refineTestCases = async (currentTestCases, userInstructions) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) throw new Error("API Key is required");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    You are an expert QA Automation Engineer.
    
    Current Test Cases (JSON):
    ${JSON.stringify(currentTestCases)}

    User Instruction:
    "${userInstructions}"

    Task:
    1. Analyze the current test cases and the user's instruction.
    2. Modify, add, or remove test cases as requested.
    3. If adding new cases, ensure they follow the same structure and numbering.
    4. "inputData" field MUST REMAIN EMPTY "". Put details in "description".
    5. Return the COMPLETELY UPDATED JSON object containing the "testCases" array and a potentially updated "suggestedFilename".

    Output Format:
    {
      "suggestedFilename": "Updated filename if context changed",
      "testCases": [ ... ]
    }
    
    Constraint: Return ONLY valid JSON. No markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const jsonString = jsonMatch[0];

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Refinement Error:", error);
    throw new Error("Failed to refine test cases: " + error.message);
  }
};
