import { GoogleGenerativeAI } from "@google/generative-ai";

// Delayed initialization to prevent app crash on load
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBVrRpX9qKA1Ucx0E4HOK9KwDk7MtXGJQY";
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your .env file and restart the server.");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Models Config:
const MODELS = [
  "gemini-2.5-flash",    // Checked: AVAILABLE
  "gemini-2.5-pro",      // Checked: Exists
  "gemini-2.0-flash",    // Checked: Exists (Rate Limited)
  "gemini-2.0-flash-exp" // Checked: Exists (Rate Limited)
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithFallback = async (promptText) => {
  const genAI = getGenAI();
  let lastError = null;
  let quotaError = null;

  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Retry logic
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts <= maxAttempts) {
        try {
          const result = await model.generateContent(promptText);
          return result;
        } catch (err) {
          if (err.message.includes("429") || err.message.includes("Overloaded") || err.message.includes("Quota")) {
            console.warn(`Model ${modelName} hit rate limit (429). Retrying in longer delay... Attempt ${attempts + 1}/${maxAttempts}`);
            quotaError = err;
            attempts++;
            // Exponential backoff starting at 5 seconds: 5s, 10s, 20s
            const waitTime = 5000 * Math.pow(2, attempts);
            await sleep(waitTime);
            continue;
          }
          throw err; // Non-quota errors (e.g. 400) should fail this model immediately and try next
        }
      }
    } catch (error) {
      console.warn(`Model ${modelName} failed/skipped:`, error.message);
      lastError = error;
      // Continue to next model in the list
    }
  }

  throw quotaError || lastError || new Error("All models failed. Please check API Key and Quota.");
};

export const generateTestCases = async (userStory, testCaseId, screenshots) => {
  let prompt = `
    You are an expert QA Automation Engineer. 
    Analyze the following User Story and generate a highly optimized set of test cases.
    
    CRITICAL INSTRUCTION:
    - **Maintain High Detail**: The User expects "Detailed Structured" test cases. 
    - **Steps**: Each test case MUST have **5 to 7 steps**. No 2-step test cases.
    - **Description**: The 'description' field must be a complete sentence including the Action AND the Data. (e.g., "Enter 'testuser@company.com' into the Username field").
    - **Verification**: The 'expectedOutcome' must be specific.

    Scope:
    1. **Positive Scenarios** (Happy Paths)
    2. **Negative Scenarios** (Error Handling)
    3. **Boundary/Edge Cases**

    Exclusions:
    - Do NOT generate "UI layout" tests unless specified.
    - Do NOT generate redundant permutations.

    User Story:
    "${userStory}"
    
    Output Format:
    Provide a JSON object with two fields:
    1. "suggestedFilename": "Concise filename"
    2. "testCases": [
      {
        "id": "TC_XXX",
        "summary": "Concise summary",
        "description": "Detailed description including purpose",
        "preConditions": "Prerequisites",
        "steps": [
          {
            "stepNumber": 1,
            "description": "Detailed action with specific data.",
            "inputData": "", 
            "expectedOutcome": "Detailed expected result."
          }
        ],
        "label": "Functional/UI/Security/Performance",
        "priority": "High/Medium/Low",
        "status": "Draft",
        "executionMinutes": "Estimated time",
        "caseFolder": "Module/Feature Name",
        "testCategory": "Regression/Smoke/Sanity"
      }
    ]

    Constraints:
    - The output must be valid JSON only. No markdown.
    - "inputData" field MUST BE EMPTY string "".
    - Logical flow, 5-7 steps per case.
  `;

  try {
    const result = await generateWithFallback(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsedData = JSON.parse(jsonMatch[0]);
    const testCasesArray = Array.isArray(parsedData) ? parsedData : parsedData.testCases;
    const filename = parsedData.suggestedFilename || "TestCases.xlsx";

    // Post-process IDs
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
          newId = `${testCaseId}_${String(index + 1).padStart(3, '0')}`;
        }
      } else {
        newId = `TC_${String(index + 1).padStart(3, '0')}`;
      }
      return { ...tc, id: newId };
    });

    return { testCases: processedCases, suggestedFilename: filename };
  } catch (error) {
    throw new Error(error.message || "Failed to generate test cases.");
  }
};

export const refineTestCases = async (currentTestCases, userInstructions) => {
  const prompt = `
    Current Test Cases (JSON):
    ${JSON.stringify(currentTestCases)}

    User Instruction:
    "${userInstructions}"

    Task:
    1. Analyze and Modify/Add/Remove test cases.
    2. Maintain structure and numbering.
    3. InputData must be empty string.
    4. Return COMPLETELY UPDATED JSON.

    Output: { "suggestedFilename": "...", "testCases": [...] }
    Constraint: Valid JSON only.
  `;

  try {
    const result = await generateWithFallback(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error("Failed to refine: " + error.message);
  }
};

export const generateCucumberFeature = async (userStory) => {
  const prompt = `
    Convert User Story to Gherkin Feature File (Cucumber).
    User Story: "${userStory}"
    Output: Raw text of feature file. No markdown.
  `;
  try {
    const result = await generateWithFallback(prompt);
    const response = await result.response;
    return response.text().replace(/^```gherkin/, '').replace(/^```feature/, '').replace(/^```/, '').replace(/```$/, '');
  } catch (error) {
    throw new Error("Failed to generate feature: " + error.message);
  }
};

export const analyzeFeatureToJson = async (featureText) => {
  const prompt = `
    Analyze Gherkin Feature File to JSON.
    Feature: ${featureText}
    Output JSON: { "feature": "...", "scenarios": [...] }
    Return ONLY valid JSON.
  `;
  try {
    const result = await generateWithFallback(prompt);
    const response = await result.response;
    let text = response.text().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Failed to analyze feature: " + error.message);
  }
};

export const generateStepDefs = async (featureText) => {
  const prompt = `
    Generate Python Step Definitions (pytest-bdd, Selenium) for:
    ${featureText}
    Output: Raw Python code. No markdown.
  `;
  try {
    const result = await generateWithFallback(prompt);
    const response = await result.response;
    return response.text().replace(/^```python/, '').replace(/^```/, '').replace(/```$/, '');
  } catch (error) {
    throw new Error("Failed to generate steps: " + error.message);
  }
};

export const generateFeatureFromCSV = async (csvData, referenceContent) => {
  const prompt = `
    Convert CSV to Gherkin Feature File.
    Reference Style: ${referenceContent}
    Input CSV: ${csvData}
    Output: Raw Gherkin text. No markdown.
  `;
  try {
    const result = await generateWithFallback(prompt);
    const response = await result.response;
    return response.text().replace(/^```gherkin/, '').replace(/^```feature/, '').replace(/^```/, '').replace(/```$/, '');
  } catch (error) {
    throw new Error("Failed to generate feature from CSV: " + error.message);
  }
};
