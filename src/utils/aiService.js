import { GoogleGenerativeAI } from "@google/generative-ai";

// Fallback model list: Preference order
// Confirmed availability for this key:
const MODELS = ["gemini-2.0-flash-exp", "gemini-exp-1206"];

const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key is required");
  return new GoogleGenerativeAI(apiKey);
};

// Helper: Try models in sequence until one works
const generateContentWithFallback = async (prompt, config = {}) => {
  const genAI = getGenAI();
  let lastError = null;

  for (const modelName of MODELS) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: config
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response; // Success! Return immediately
    } catch (error) {
      console.warn(`Failed with ${modelName}:`, error.message);
      lastError = error;

      // If it's not a quota/server error (e.g., safety block), maybe don't retry? 
      // For now, we assume we want to try all models for robustness.
      if (error.message.includes("429") || error.message.includes("503") || error.message.includes("404")) {
        continue; // Try next model
      }
      throw error; // Rethrow other errors (like invalid API key)
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message}`);
};

export const generateTestCases = async (userStory, testCaseId, screenshots) => {
  const generationConfig = {
    temperature: 0.3,
    topP: 0.8,
    topK: 40,
  };

  let prompt = `
    You are an expert QA Automation Engineer. 
    Analyze the following User Story and generate a highly optimized set of test cases.

    CRITICAL INSTRUCTION:
    - Quality over Quantity. 
    - Generate ONLY the necessary test cases to cover the requirements.
    - Guidelines for Test Count:
      - Simple Features: 5-10 test cases.
      - Medium Complexity: 10-15 test cases.
      - High Complexity: 15-20 test cases.
    - Do NOT exceed 20 test cases unless absolutely necessary for critical safety/security logic.
    - Group similar validations into single test cases where logical.

    Scope:
    1. **Positive Scenarios** (Happy Paths): Verify feature works as intended.
    2. **Negative Scenarios** (Error Handling): Verify system handles invalid input/state gracefully.
    3. **Boundary/Edge Cases**: Verify limits (min/max values, empty states).

    Exclusions:
    - Do NOT generate "UI layout" tests (alignment, colors) unless specified in User Story.
    - Do NOT generate redundant permutations (e.g., testing 10 different invalid email formats - just test 1 or 2 representative invalid ones).

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
    - Ensure logical flow in test steps.
    - Test steps should be detailed (typically 5-7 steps).
  `;

  try {
    const response = await generateContentWithFallback(prompt, generationConfig);
    const text = response.text();

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const jsonString = jsonMatch[0];

    const parsedData = JSON.parse(jsonString);

    const testCasesArray = Array.isArray(parsedData) ? parsedData : parsedData.testCases;
    const filename = parsedData.suggestedFilename || "TestCases.xlsx";

    // Post-process to ensure IDs match
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
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate test cases.");
  }
};

export const refineTestCases = async (currentTestCases, userInstructions) => {
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
    const response = await generateContentWithFallback(prompt);
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Refinement Error:", error);
    throw new Error("Failed to refine test cases: " + error.message);
  }
};

export const generateCucumberFeature = async (userStory) => {
  const prompt = `
    You are an expert QA Automation Engineer.
    Convert the following User Story into a Gherkin Feature File (Cucumber).

    User Story:
    "${userStory}"

    Requirements:
    - Feature Name: Concise and descriptive.
    - Scenarios: Cover positive, negative, and edge cases.
    - Syntax: Standard Gherkin (Given, When, Then, And, But).
    - Language: English.

    Output Format:
    Return ONLY the raw text of the feature file. Do not include markdown code block markers.
  `;

  try {
    const response = await generateContentWithFallback(prompt);
    return response.text();
  } catch (error) {
    throw new Error("Failed to generate feature file: " + error.message);
  }
};

export const analyzeFeatureToJson = async (featureText) => {
  const prompt = `
    Analyze this Gherkin Feature File and convert it into a structured JSON object.

    Feature File:
    ${featureText}

    Output Format (JSON):
    {
      "feature": "Feature Name",
      "description": "Feature Description (if any)",
      "scenarios": [
        {
          "name": "Scenario Name",
          "steps": [
            { "keyword": "Given", "text": "..." },
            { "keyword": "When", "text": "..." },
            { "keyword": "Then", "text": "..." }
          ]
        }
      ]
    }
  `;

  try {
    const response = await generateContentWithFallback(prompt, { responseMimeType: "application/json" });
    return JSON.parse(response.text());
  } catch (error) {
    throw new Error("Failed to analyze feature file: " + error.message);
  }
};

export const generateStepDefs = async (featureText) => {
  const prompt = `
    You are an expert SDET.
    Generate Python Step Definitions for the following Feature File using Selenium WebDriver and 'pytest-bdd'.

    Feature File:
    ${featureText}

    Requirements:
    - Framework: pytest-bdd
    - Browser: Chrome (Headless option)
    - Structure:
      - Step matching: Use snake_case functions decorated with @given, @when, @then.
     
    Output Format:
    Return ONLY the valid Python code. Do not include markdown code blocks.
  `;

  try {
    const response = await generateContentWithFallback(prompt);
    let text = response.text();
    text = text.replace(/^```python/, '').replace(/^```/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    throw new Error("Failed to generate step definitions: " + error.message);
  }
};
export const generateFeatureFromCSV = async (csvData, referenceContent) => {
  const prompt = `
    I need a feature file with optimal steps. I will give you a csv file with testcases , convert them into a feature file not a python code to generate the feature file. 
    Combine the steps wherever possible and take reference from my attached previous file.
    
    The feature file should have a structure of my previous or attached reference files. 
    All steps in the csv should be covered and don't obmit any steps and it should be meaningful.

    Reference Feature File Content (Style Guide):
    ${referenceContent}

    Input CSV Data:
    ${csvData}

    Output Format:
    Return ONLY the raw text of the Gherkin feature file. Do not include markdown code block markers.
  `;

  try {
    const response = await generateContentWithFallback(prompt);
    let text = response.text();
    // Strip markdown if present
    text = text.replace(/^```gherkin/, '').replace(/^```feature/, '').replace(/^```/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    throw new Error("Failed to generate feature from CSV: " + error.message);
  }
};
