// AI Service for Compass QA (Supports Gemini & Mistral)

import { SAMPLE_FEATURE_REF, SAMPLE_STEP_DEF_REF } from './sampleData';

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
 * Adapter to unify API calls via Node.js Backend with Client-side Fallback
 */
const callAIAPI = async (messages, responseFormat = "json_object") => {
  const memoryContext = getGlobalMemory();
  const enhancedMessages = [...messages];

  if (memoryContext) {
    // Inject memory into the first system message if it exists
    const systemIdx = enhancedMessages.findIndex(m => m.role === 'system');
    const memoryInstruction = `\n\n### LEARNED PREFERENCES (PAST CONVERSATIONS):\n${memoryContext}\nFollow these preferences strictly as they reflect the user's established standards.`;

    if (systemIdx !== -1) {
      enhancedMessages[systemIdx].content += memoryInstruction;
    } else {
      enhancedMessages.unshift({ role: 'system', content: memoryInstruction });
    }
  }

  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: enhancedMessages, format: responseFormat })
    });

    if (response.ok) {
      const data = await response.json();
      return data.content;
    }
    return await clientSideFallback(enhancedMessages, responseFormat);
  } catch (error) {
    return await clientSideFallback(enhancedMessages, responseFormat);
  }
};

const clientSideFallback = async (messages, responseFormat) => {
  const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const MISTRAL_KEY = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;

  if (!GEMINI_KEY && !MISTRAL_KEY) {
    throw new Error("AI Services unreachable. Configure API keys in GitHub Secrets.");
  }

  if (GEMINI_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}`;
      const userMsgs = messages.filter(m => m.role !== 'system');
      const systemMsg = messages.find(m => m.role === 'system');
      const body = {
        contents: userMsgs.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        generationConfig: {
          temperature: 0.2,
          responseMimeType: responseFormat === "json_object" ? "application/json" : "text/plain"
        }
      };
      if (systemMsg) body.systemInstruction = { parts: [{ text: systemMsg.content }] };
      const res = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (e) { console.error("Gemini Fallback Failed", e); }
  }

  if (MISTRAL_KEY) {
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MISTRAL_KEY}` },
        body: JSON.stringify({ model: 'mistral-small-latest', messages, response_format: { type: responseFormat } })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (e) { console.error("Mistral Fallback Failed", e); }
  }
  throw new Error("AI Fallback failed");
};

/**
 * Text-only helper (Wrapper)
 */
const callAIAPI_Text = async (prompt) => {
  const messages = [{ role: "user", content: prompt }];
  const content = await callAIAPI(messages, "text");
  // Strip markdown if present
  return content.replace(/^```[a-z]*\n/, '').replace(/```$/, '').trim();
};


// ------------------------------------------------------------------
// PUBLIC METHODS (Keep signatures identical to prevent UI breakage)
// ------------------------------------------------------------------

export const generateTestCases = async (userStory, testCaseId, screenshots) => {
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
  const prompt = `
  You are an expert Automation Engineer. Convert the following target CSV into a Gherkin Feature file.
  
  ### REFERENCE SAMPLES (Follow this Style Exactly):
  Sample CSV Input:
  ${sampleCsv}
  
  Sample Feature Output:
  ${sampleFeature}
  
  ### TARGET CSV TO CONVERT:
  ${csvData}
  
  **INSTRUCTIONS**:
  1. Maintain the exact Gherkin structure and indentation.
  2. Use Scenario Outlines for data-driven tests.
  3. Ensure the Feature name and Scenario descriptions are meaningful.
  4. Return ONLY the Gherkin text. No explanations.
  `;

  return await callAIAPI_Text(prompt);
};

export const generateStepDefs = async (featureContent) => {
  const prompt = `
  **GOAL**: Create a "Perfect" Selenium Python Step Definition file for the provided Feature File.
  
  **STRICT REQUIREMENTS (100% ACCURACY)**:
  1. **Structure**: You MUST follow the EXACT structure, imports, and coding style of the **REFERENCE STEP DEFINITION** provided below. No deviations.
  2. **Content**: Convert **ALL** steps from the Input Feature File into Python step definitions. Do not miss any.
  3. **Imports**: Use the same import style (e.g., 'from business_components...', 'from object_repository...'). 
     - *Note*: You may infer logical names for new components/pages if they don't exist in the sample, but keep the pattern.
  4. **Data Handling**: 
     - Use 'json_data' and 'load_test_data_from_json'.
     - Use '@pytest.mark.parametrize' for steps with placeholder data (e.g., '<inputData>').
  5. **Accuracy**: Ensure the code is syntactically correct and logically matches the BDD steps.
  
  ### REFERENCE FEATURE (Style Guide)
  ${SAMPLE_FEATURE_REF}
  
  ### REFERENCE STEP DEFINITION (Code Style Guide)
  ${SAMPLE_STEP_DEF_REF}
  
  ### INPUT FEATURE FILE:
  ${featureContent}
  
  **OUTPUT**: Return ONLY the Python code. No markdown boxes, no explanations.
  `;

  return await callAIAPI_Text(prompt);
};
