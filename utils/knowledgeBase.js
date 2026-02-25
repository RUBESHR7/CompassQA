export const KNOWLEDGE_BASE = `
# COMPASS QA KNOWLEDGE BASE

## 1. APPLICATION OVERVIEW
**Compass QA** is an advanced AI-powered Quality Assurance tool designed to streamline the Test Case Design process.
- **Goal**: Accelerate QA workflows by automating test case generation, feature file creation, and step definition scripting.
- **Core Technology**: Built with React, Vite, and powered by Mistral AI (or Google Gemini via compatibility layer).

## 2. KEY MODULES & FEATURES

### A. Test Case Generator (Dashboard)
- **Input**: User Story (text) + Optional Screenshots.
- **Output**: Detailed Test Cases in a structured table format.
- **Key Fields**: ID, Summary, Pre-conditions, Steps, Expected Result, Priority.
- **Features**:
  - **AI Generation**: Creates 5-7 detailed steps per case.
  - **Refine with AI**: Chatbot can modify test cases (e.g., "Add a negative scenario").
  - **Export**: Download as Excel (.xlsx).

### B. Feature File Generator (/feature-generator)
- **Purpose**: Convert Requirements (Excel/CSV) into Gherkin Feature Files.
- **Input**: Excel/CSV file containing test scenarios.
- **Output**: Gherkin syntax (.feature file).
- **Features**:
  - **Auto-Formatting**: Automatically creates Scenario Outlines and Examples tables.
  - **History**: Tracks all generated files.
  - **AI Refinement**: Chatbot can tweak the Gherkin text.

### C. Step Definition Generator (/step-def-generator)
- **Purpose**: Bridge the gap between BDD and Automation Code.
- **Input**: Gherkin Feature Text.
- **Output**: Python Selenium Step Definitions.
- **Features**:
  - **Selenium Best Practices**: Uses \`expected_conditions\`, \`WebDriverWait\`, and Page Object Model patterns.
  - **Dynamic Elements**: Intelligently guesses locators (ID, XPath, CSS).

### D. JSON Analyzer (/json-analyzer)
- **Purpose**: Data transformation helper.
- **Input**: Gherkin Feature File.
- **Output**: Structured JSON Map (flat structure).
- **Use Case**: Useful for feeding test data into other frameworks or APIs.

## 3. QA BEST PRACTICES (AI GUIDELINES)
- **Test Case Design**:
  - Always separate Data from Action.
  - Titles should be concise but descriptive.
  - Steps must be reproducible.
- **Gherkin Syntax**:
  - Keywords: Feature, Scenario, Given, When, Then, And, But.
  - Use "Scenario Outline" + "Examples" for data-driven tests.
  - Keep steps business-readable, not code-readable.
- **Automation (Selenium)**:
  - Avoid hard waits (\`time.sleep\`). Use Explicit Waits.
  - Use meaningful variable names.
  - abstract locators into a shared repository if possible.

## 4. TROUBLESHOOTING & FAQ
- **"Blank Page after Generation"**: Usually caused by malformed AI JSON output. The system now has safety checks to handle empty/partial data.
- **"Quota Limit"**: The AI API has rate limits. Wait 60 seconds and try again.
- **"How to refine?"**: Click the "Refine with AI" button (Sparkles icon) in any results view.

## 5. SYSTEM PROMPTS & PERSONA
- **Role**: Compass AI, an Expert QA Automation Engineer.
- **Tone**: Professional, Helpful, Technical but Accessible.
- **Constraint**: Always output valid JSON when performing structured tasks.
`;
