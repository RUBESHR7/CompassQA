// Mistral AI Service for Compass QA

import { SAMPLE_CSV, SAMPLE_FEATURE, SAMPLE_FEATURE_REF, SAMPLE_STEP_DEF_REF } from './sampleData';

const API_KEY = import.meta.env.VITE_MISTRAL_API_KEY || "LRLyHILgxpL0jvTaHkHJyHKl0eFppnMs";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MODEL = "mistral-small-latest";

/**
 * Helper function to call Mistral API
 */
const callMistralAPI = async (messages, responseFormat = "json_object") => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your .env file or hardcoded fallback.");
  }

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        response_format: { type: responseFormat },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Mistral API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Mistral API Request Failed:", error);
    throw new Error(error.message || "Failed to communicate with Mistral AI.");
  }
};

/**
 * Text-only helper for non-JSON outputs (like Gherkin/Python)
 */
const callMistralAPI_Text = async (prompt) => {
  const messages = [{ role: "user", content: prompt }];

  if (!API_KEY) throw new Error("API Key missing");

  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || response.statusText);
  }
  const data = await response.json();
  let content = data.choices[0].message.content;
  // Strip markdown blocks if present
  return content.replace(/^```[a-z]*\n/, '').replace(/```$/, '').trim();
};

export const generateTestCases = async (userStory, testCaseId, screenshots) => {
  const systemPrompt = `
    You are an expert QA Automation Engineer acting as the engine for "Compass QA".
    Your goal is to generate "Perfect" detailed, structured test cases from User Stories.
    
    ### STANDARDS FOR "PERFECT" TEST CASES:
    1.  **High Detail**: Every field must be verbose and specific.
    2.  **Step Count**: Each test case MUST have **5 to 7 steps**.
    3.  **Description**: Must be a complete sentence covering Action + Data.
    4.  **Expected Outcome**: Must be specific.
    5.  **Scope**: Cover Happy Path, Negative Scenarios, and Edge Cases.
    
    ### OUTPUT SCHEMA (JSON ONLY):
    You must return a JSON object with this exact structure:
    {
      "suggestedFilename": "string (e.g., FeatureName_TestCases.xlsx)",
      "testCases": [
        {
          "id": "TC_XXX", 
          "summary": "Concise title",
          "description": "Detailed explanation of what is being tested",
          "preConditions": "Prerequisites",
          "steps": [
            {
              "stepNumber": 1,
              "description": "Action details",
              "inputData": "",
              "expectedOutcome": "Result details"
            }
          ],
          "label": "Functional",
          "priority": "High",
          "status": "Draft",
          "executionMinutes": "5",
          "caseFolder": "Module Name",
          "testCategory": "Regression"
        }
      ]
    }
    
    CRITICAL: 
    - "inputData" field MUST BE an empty string "".
    - Do NOT include any markdown formatting. Return RAW JSON only.
  `;

  const userMessage = `Generate detailed test cases for this User Story:\n"${userStory}"`;

  try {
    const responseText = await callMistralAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ]);

    const cleanText = responseText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsedData = JSON.parse(cleanText);

    const testCasesArray = Array.isArray(parsedData.testCases) ? parsedData.testCases : [];
    const filename = parsedData.suggestedFilename || "Generated_TestCases.xlsx";

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
    console.error("Generate Test Cases Error:", error);
    throw new Error("Failed to generate test cases: " + error.message);
  }
};

export const refineTestCases = async (currentTestCases, userInstructions) => {
  const systemPrompt = `
    You are an expert QA Engineer. Refine the provided test cases based on user instructions.
    
    Rules:
    1. Output MUST be valid JSON matching the previous structure.
    2. Maintain the "inputData": "" constraint.
    3. Apply the user's specific feedback.
    4. Return the FULL updated list inside { "suggestedFilename": "...", "testCases": [...] }.
  `;

  const userMessage = `
    Current Test Cases: ${JSON.stringify(currentTestCases)}
    User Instructions: "${userInstructions}"
  `;

  try {
    const responseText = await callMistralAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ]);
    const cleanText = responseText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    throw new Error("Failed to refine: " + error.message);
  }
};

export const generateCucumberFeature = async (userStory) => {
  const prompt = `Convert this User Story to a Gherkin Feature File (Cucumber).\nUser Story: "${userStory}"\nOutput ONLY the raw Gherkin text. No markdown.`;

  try {
    return await callMistralAPI_Text(prompt);
  } catch (error) {
    throw new Error("Failed to generate feature: " + error.message);
  }
};

export const analyzeFeatureToJson = async (featureText) => {
  const prompt = `Analyze this Gherkin Feature and return JSON: { "feature": "name", "scenarios": [...] }.\nFeature:\n${featureText}`;
  try {
    const text = await callMistralAPI([
      { role: "user", content: prompt }
    ], "json_object");
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Failed to analyze feature: " + error.message);
  }
};

export const generateStepDefs = async (featureText) => {
  const prompt = `
  **GOAL**: Create a "Perfect" Selenium Python Step Definition file for the provided Feature File.
  
  **STRICT REQUIREMENTS**:
  1. **Structure**: You MUST follow the EXACT structure, imports, and coding style of the **REFERENCE STEP DEFINITION** provided below.
  2. **Content**: Convert **ALL** steps from the Input Feature File into Python step definitions. Do not miss any.
  3. **Imports**: Use the same import style (e.g., 'from business_components...', 'from object_repository...'). 
     - *Note*: You may infer logical names for new components/pages if they don't exist in the sample, but keep the pattern.
  4. **Data Handling**: 
     - Use 'json_data' and 'load_test_data_from_json'.
     - Use '@pytest.mark.parametrize' for steps with placeholder data (e.g., '<inputData>').
  
  ### REFERENCE FEATURE (Style Guide)
  ${SAMPLE_FEATURE_REF}
  
  ### REFERENCE STEP DEFINITION (Style Guide)
  ${SAMPLE_STEP_DEF_REF}
  
  ### INPUT FEATURE FILE (Convert this)
  ${featureText}
  
  **OUTPUT PYTHON CODE ONLY** (No markdown, no explanations)`;

  try {
    return await callMistralAPI_Text(prompt);
  } catch (error) {
    throw new Error("Failed to generate steps: " + error.message);
  }
};

export const generateFeatureFromCSV = async (csvData, sampleCsv = "", sampleFeature = "") => {
  let prompt = `I need a feature file with **Scenario Outlines** and **Examples Tables**. 
  
  **CRITICAL RULES:**
  1. **Identify Parameters**: Analyze the input CSV. If a column contains variable data, replace specific values in the steps with parameters like '<inputData>', '<successMsg>'.
  2. **Scenario Outline**: ALWAYS use 'Scenario Outline' instead of 'Scenario' when parameters are used.
  3. **Examples Table**: You MUST generate an 'Examples:' table at the end of each scenario.
     - The table headers MUST match the parameters used in the steps.
     - The table rows must contain the actual data from the CSV.
  4. **Structure**: Follow the EXACT structure of the attached reference file style.
  5. **Completeness**: Do not omit any steps.`;

  if (sampleCsv && sampleFeature) {
    prompt += `\n\n### STYLE REFERENCE (FOLLOW STRICTLY)\nSample CSV:\n${sampleCsv}\n\nSample Feature (Target Format):\n${sampleFeature}\n\n### END REFERENCE\n`;
  }

  prompt += `\n\n### TARGET DATA\nConvert this CSV into a Feature File with Scenario Outlines and Examples tables:\n${csvData}\n\nOutput ONLY raw Gherkin text. No markdown.`;

  try {
    return await callMistralAPI_Text(prompt);
  } catch (error) {
    throw new Error("Failed to generate feature from CSV: " + error.message);
  }
};

export const generateJsonFromFeature = async (featureText, sampleJson) => {
  const prompt = `
  You are a JSON Converter.
  
  **GOAL**: Convert the Feature File data into a simple flat JSON map.
  
  **INSTRUCTIONS**:
  1.  Ignored standard Gherkin JSON format. Do NOT use "features", "elements", "steps".
  2.  **Output Structure**:
      {
        "test": {
          "generic": { ... },
          "AMCC-TC-XXX": { ... },
          "AMCC-TC-YYY": { ... }
        }
      }
  3.  **Extraction**:
      -   Look for "Examples" tables in the Feature.
      -   Each row in the Examples table corresponds to a Test Case ID.
      -   Map the columns of that row to valid JSON keys.
      -   If the column value is a JSON string itself (like "{...}"), parse it into an object.
  4.  **Generic**: Extract common strings or "generic" marked values into the "generic" object.
  
  **REFERENCE STYLE**:
  ${sampleJson}
  
  **INPUT**:
  ${featureText}
  
  **OUTPUT JSON ONLY**`;

  try {
    const text = await callMistralAPI([
      { role: "user", content: prompt }
    ], "json_object");
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Failed to generate JSON from Feature: " + error.message);
  }
};
