// AI Service for Compass QA (Supports Gemini & Mistral)

import { SAMPLE_FEATURE_REF, SAMPLE_STEP_DEF_REF } from './sampleData';
import { saveToKnowledgeStore, retrieveRelevantContext } from './knowledgeStore';

const SERVER_URL = '/api/ai/chat';

/**
 * Memory Management: Persistent learning across sessions
 */
const getGlobalMemory = () => {
  if (typeof window === 'undefined') return "";
  const memory = localStorage.getItem('compass_qa_memory');
  if (!memory) return "";

  try {
    const rules = JSON.parse(memory);
    return rules.map((r, i) => `${i + 1}. ${r}`).join('\n');
  } catch (e) {
    return "";
  }
};

/**
 * Secure API caller — ALL requests go through the server-side API route.
 * API keys (GEMINI_API_KEY, MISTRAL_API_KEY) live ONLY on Vercel server.
 * They are NEVER sent to or accessible from the browser.
 */
const callAIAPI = async (messages, responseFormat = "json_object") => {
  const memoryContext = getGlobalMemory();
  const enhancedMessages = [...messages];

  if (memoryContext) {
    const systemIdx = enhancedMessages.findIndex(m => m.role === 'system');
    const memoryInstruction = `\n\n### LEARNED PREFERENCES (PAST CONVERSATIONS):\n${memoryContext}\nFollow these preferences strictly as they reflect the user's established standards.`;
    if (systemIdx !== -1) {
      enhancedMessages[systemIdx].content += memoryInstruction;
    } else {
      enhancedMessages.unshift({ role: 'system', content: memoryInstruction });
    }
  }

  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: enhancedMessages, format: responseFormat })
  });

  if (!response.ok) {
    let errMsg = `Server error (${response.status})`;
    try {
      const errData = await response.json();
      errMsg = errData.error || errMsg;
    } catch { /* ignore parse errors */ }
    throw new Error(errMsg);
  }

  const data = await response.json();
  if (!data.content) throw new Error("AI returned an empty response.");
  return data.content;
};

/**
 * Text-only helper (Wrapper) with safe empty-response guard
 */
const callAIAPI_Text = async (prompt) => {
  const messages = [{ role: "user", content: prompt }];
  const content = await callAIAPI(messages, "text");
  if (!content || content.trim() === "") {
    throw new Error("AI returned an empty response. The network may be blocking the request.");
  }
  // Strip markdown if present
  return content.replace(/^```[a-z]*\n/, '').replace(/```$/, '').trim();
};


// ------------------------------------------------------------------
// PUBLIC METHODS (Keep signatures identical to prevent UI breakage)
// ------------------------------------------------------------------

export const generateTestCases = async (userStory, testCaseId, screenshots) => {
  // Retrieve relevant past test cases for context (RAG)
  const pastContext = retrieveRelevantContext(userStory, ['test-case', 'feature']);

  const systemPrompt = `
    You are an expert QA Automation Engineer acting as the engine for "Compass QA".
    Your goal is to generate "Perfect" detailed, structured test cases from User Stories.
    
    ### STANDARDS FOR "PERFECT" TEST CASES:
    1.  **High Detail**: Every field must be verbose and specific.
    2.  **Step Count**: Each test case MUST have **5 to 7 steps**.
    3.  **Description**: Must be a complete sentence covering Action + Data.
    4.  **Priority**: Use 'P0 (Critical)', 'P1 (High)', 'P2 (Medium)', or 'P3 (Low)'.
    5.  **Test Data**: If sensitive, use placeholders like <username> or <password>.
    6.  **Edge Cases**: Include at least one negative or boundary value test case.
    7.  **CRITICAL - Consistency**: If past test cases are provided below, reuse the EXACT same:
        - Pre-condition text (especially login steps)
        - Navigation step wording
        - Page/screen names and terminology
        This ensures all test cases across the project are consistent.

    ### OUTPUT FORMAT:
    You MUST return a JSON object with this EXACT structure:
    {
      "suggestedFilename": "AMCC-XXXX_FeatureName.xlsx",
      "testCases": [
        {
          "id": "TC_001",
          "summary": "...",
          "preConditions": "...",
          "steps": "1. ...\\n2. ...",
          "expectedResult": "...",
          "priority": "P1"
        }
      ]
    }
    ${pastContext}
  `;

  const userPrompt = `
    User Story: ${userStory}
    ${testCaseId ? `Base ID: ${testCaseId}` : ""}
    ${screenshots && screenshots.length > 0 ? `Context from Screenshots: ${screenshots.join(", ")}` : ""}
    
    Generate the JSON following the standards.
  `;

  try {
    const responseText = await callAIAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
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

    // Save to knowledge store for future context
    saveToKnowledgeStore('test-case', { testCases: processedCases, suggestedFilename: filename }, userStory.substring(0, 80));

    return { testCases: processedCases, suggestedFilename: filename };

  } catch (error) {
    console.error("Generate Test Cases Error:", error);
    throw new Error("Failed to generate test cases: " + error.message);
  }
};

import { KNOWLEDGE_BASE } from './knowledgeBase';

export const chatWithAI = async (contextData, userInstructions, contextType = "test-cases", messageHistory = []) => {
  let systemContext = "";
  let dataContext = "";

  const commonKnowledge = `
    Use the following KNOWLEDGE BASE to answer general questions:
    ${KNOWLEDGE_BASE}
  `;

  if (contextType === "test-cases") {
    systemContext = `
      You are "Compass AI", an expert QA Automation Engineer.
      You are assisting a user with Test Case Design.
      ${commonKnowledge}
      
      Your capability:
      1. **Chat**: Answer questions about QA, testing, or general topics.
      2. **Refine**: Modify the provided Test Cases based on instructions.
      3. **Memorize**: If the user gives a permanent rule (e.g., "Always use P0 for login", "Never include wait times"), start your answer with "MEMORY_SAVE: [The Rule]" on a new line.

      Current Data Structure (Test Cases):
      { "suggestedFilename": "...", "testCases": [...] }

      **CRITICAL OUTPUT RULES**:
      You must ALWAYS return a JSON object with this structure:
      {
        "message": "Your conversational response here.",
        "updatedData": null | { ... new data matching the structure ... }
      }
    `;
    dataContext = `Current Test Cases: ${JSON.stringify(contextData)}`;
  } else if (contextType === "gherkin") {
    systemContext = `
      You are "Compass AI", an expert QA Automation Engineer.
      You are assisting a user with Gherkin Feature Files.
      ${commonKnowledge}

      Your capability:
      1. **Chat**: Answer questions about Gherkin, BDD, or Cucumber.
      2. **Refine**: Modify the provided Feature File text.
      3. **Memorize**: If the user gives a permanent rule (e.g., "Always use Scenario Outlines"), start your answer with "MEMORY_SAVE: [The Rule]" on a new line.

      **CRITICAL OUTPUT RULES**:
      You must ALWAYS return a JSON object with this structure:
      {
        "message": "Your conversational response here.",
        "updatedData": null | "The full updated Gherkin text string"
      }
    `;
    dataContext = `Current Feature File:\n${contextData}`;
  } else if (contextType === "step-def") {
    systemContext = `
      You are "Compass AI", an expert QA Automation Engineer.
      You are assisting a user with Python/Selenium Step Definitions.
      ${commonKnowledge}

      Your capability:
      1. **Chat**: Answer questions about Python, Selenium, or coding.
      2. **Refine**: Modify the provided Python code.
      3. **Memorize**: If the user gives a permanent rule (e.g., "Always use CSS selectors over XPath"), start your answer with "MEMORY_SAVE: [The Rule]" on a new line.

      **CRITICAL OUTPUT RULES**:
      You must ALWAYS return a JSON object with this structure:
      {
        "message": "Your conversational response here.",
        "updatedData": null | "The full updated Python code string"
      }
    `;
    dataContext = `Current Code:\n${contextData}`;
  }

  const systemPrompt = `
    ${systemContext}
    
    IMPORTANT: 
    - Output RAW JSON only. No markdown formatting.
    - If updatedData is provided, it must be the COMPLETE file/object, not just a diff.
  `;

  // Prepare messages with history for memory/conversational continuity
  const apiMessages = [
    { role: "system", content: systemPrompt }
  ];

  // Add history (convert from UI role names to API role names)
  messageHistory.forEach(msg => {
    apiMessages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  });

  // Add the current request
  apiMessages.push({
    role: "user",
    content: `${dataContext}\n\nUser Instructions: "${userInstructions}"`
  });

  try {
    const responseText = await callAIAPI(apiMessages, "json_object");
    const cleanText = responseText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    const result = JSON.parse(cleanText);

    // Filter out memory signals from the user-facing message but capture them
    if (result.message && result.message.includes("MEMORY_SAVE:")) {
      const match = result.message.match(/MEMORY_SAVE:\s*(.*)/);
      if (match) {
        const rule = match[1];
        saveMemoryRule(rule);
        result.message = result.message.replace(/MEMORY_SAVE:.*\n?/, '').trim();
      }
    }

    return result;
  } catch (error) {
    throw new Error("AI Chat Failed: " + error.message);
  }
};

const saveMemoryRule = (rule) => {
  if (typeof window === 'undefined') return;
  const memory = localStorage.getItem('compass_qa_memory');
  let rules = memory ? JSON.parse(memory) : [];
  if (!rules.includes(rule)) {
    rules.push(rule);
    localStorage.setItem('compass_qa_memory', JSON.stringify(rules));
  }
};

export const refineTestCases = async (currentTestCases, userInstructions) => {
  const result = await chatWithAI(currentTestCases, userInstructions, "test-cases");
  if (result.updatedData) {
    return { ...result.updatedData, message: result.message };
  }
  return { message: result.message };
};

export const generateFeatureFromCSV = async (csvData, sampleCsv, sampleFeature) => {
  // Retrieve relevant past feature files for context (RAG)
  const pastContext = retrieveRelevantContext(csvData, ['feature', 'step-def']);

  const prompt = `
  You are an expert Automation Engineer. Convert the following target CSV into a perfect Gherkin Feature file.
  
  ### REFERENCE STYLE SAMPLE (Follow this Style Exactly):
  Sample CSV Input:
  ${sampleCsv}
  
  Sample Feature Output:
  ${sampleFeature}
  
  ${pastContext}
  
  ### TARGET CSV TO CONVERT:
  ${csvData}
  
  **INSTRUCTIONS (100% ACCURACY REQUIRED)**:
  1. Maintain the exact Gherkin structure and indentation from the style sample.
  2. Use Scenario Outlines with Examples for data-driven tests.
  3. If past feature files are provided above, reuse the EXACT same:
     - Login step text (e.g., "Login to the Cold Compass application with valid credentials")
     - Navigation step wording (e.g., "Navigate to Administration -> Access Item Management Tab") 
     - Tag format (@regression @feature-name @amcc-XXX)
  4. Return ONLY the Gherkin text. No explanations, no markdown.
  `;

  const result = await callAIAPI_Text(prompt);
  // Save the generated feature file to knowledge store
  saveToKnowledgeStore('feature', result, csvData.substring(0, 80));
  return result;
};

export const generateStepDefs = async (featureContent) => {
  // Retrieve relevant past step definitions for context (RAG)
  const pastContext = retrieveRelevantContext(featureContent, ['step-def']);

  const prompt = `
  **GOAL**: Create a "Perfect" Selenium Python Step Definition file for the provided Feature File.
  
  **STRICT REQUIREMENTS (100% ACCURACY)**:
  1. **Structure**: You MUST follow the EXACT structure, imports, and coding style of the REFERENCE STEP DEFINITION below.
  2. **Content**: Convert ALL steps from the Feature File into Python step definitions. Do not miss any step.
  3. **Imports**: Use the same import pattern:
     - from business_components.web_components.XxxPage import xxx_function
     - from object_repository.pages.Module.SubModule.XxxPage import XxxPage
     - from utilities.helper import generate_random_number, load_test_data_from_json
  4. **Data Handling**: Use json_data with load_test_data_from_json. Use @pytest.mark.parametrize for <placeholders>.
  5. **CRITICAL - No Duplication**: If past step definitions are provided below, DO NOT re-create any function
     that already exists (e.g., login_to_application). Instead, those steps are already handled — skip them.
  6. **Locators**: Use Page Object pattern. Reference locators from the appropriate Page class.
  
  ### REFERENCE STEP DEFINITION (Code Style - Follow Exactly)
  ${SAMPLE_STEP_DEF_REF}
  
  ${pastContext}
  
  ### INPUT FEATURE FILE:
  ${featureContent}
  
  **OUTPUT**: Return ONLY the Python code. No markdown, no explanations.
  `;

  const result = await callAIAPI_Text(prompt);
  // Save to knowledge store for future step def generation
  saveToKnowledgeStore('step-def', result, featureContent.substring(0, 80));
  return result;
};
