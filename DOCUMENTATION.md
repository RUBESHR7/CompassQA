# Compass QA - Technical Documentation

## Executive Summary
**Compass QA** is a next-generation Quality Assurance automation tool designed to streamline the test case creation process. By leveraging advanced Artificial Intelligence (Google Gemini), it transforms raw user stories and visual screenshots into structured, comprehensive test suites. The application features a premium, "Web3-style" user interface and exports directly to industry-standard Excel formats, significantly reducing manual effort for QA engineers.

---

## Technology Stack

### Core Framework
-   **React 19**: The latest version of the industry-leading JavaScript library for building user interfaces, utilizing functional components and Hooks for state management.
-   **Vite**: A next-generation build tool that provides a lightning-fast development server and optimized production builds.

### Artificial Intelligence
-   **Google Gemini API (`@google/generative-ai`)**: Powered by Google's `gemini-1.5-flash` model, this integration enables the application to understand complex user requirements and analyze visual inputs (screenshots) to generate context-aware test cases.

### Utilities & Libraries
-   **ExcelJS**: A powerful library used to generate rich `.xlsx` files directly in the browser. It handles complex formatting, cell merging, and data validation to ensure the output is ready for professional use.
-   **Lucide React**: A collection of beautiful, consistent SVG icons that enhance the visual hierarchy and user experience.
-   **GitHub Pages**: A serverless hosting solution that serves the application directly from the GitHub repository, ensuring high availability and zero infrastructure cost.

### Styling
-   **CSS3 (Custom)**: The application uses a bespoke design system featuring:
    -   **Glassmorphism**: Translucent, frosted-glass effects for a modern, depth-rich aesthetic.
    -   **Bento Grid Layout**: A responsive, card-based layout inspired by modern dashboard designs.
    -   **3D Particle Animations**: A custom HTML5 Canvas implementation for the dynamic background.

---

## System Architecture

Compass QA operates as a **Serverless Single Page Application (SPA)**.

1.  **Client-Side Execution**: All logic, including UI rendering, state management, and file generation, runs directly in the user's browser. This ensures data privacy and low latency.
2.  **Direct AI Integration**: The application communicates directly with Google's Gemini API endpoints. No intermediate backend server is required, simplifying the architecture and reducing maintenance.
3.  **Static Deployment**: The build artifact is a set of static files (HTML, CSS, JS) hosted globally via GitHub Pages.

---

## Key Features

### 1. AI-Driven Test Generation
Users input a User Story and optional Screenshots. The AI analyzes the intent and visual context to generate:
-   **Test Case IDs**: Auto-incremented and structured.
-   **Pre-conditions**: Contextual setup requirements.
-   **Step-by-Step Instructions**: Detailed actions.
-   **Expected Results**: Clear verification points.

### 2. Interactive AI Refinement
A built-in **Chatbot Interface** allows users to refine the generated results using natural language.
-   *Example*: "Add a negative test case for invalid password."
-   The AI modifies the existing dataset in real-time based on the instruction.

### 3. Smart Excel Export
The application generates a professionally formatted Excel file with:
-   **Dynamic Filenames**: Context-aware names (e.g., `Login_Feature_Tests.xlsx`).
-   **Merged Cells**: For better readability of steps within a single test case.
-   **Clean Data Structure**: "Input Data" is intelligently merged into descriptions to keep the layout clean.

### 4. Responsive Premium UI
-   **Mobile Optimized**: Fully functional on smartphones and tablets.
-   **Dark Mode**: A deep, contrast-rich theme designed for long working sessions.

---

## End-to-End User Workflow

1.  **Input**: User enters a User Story (e.g., "As a user, I want to login...") and uploads UI screenshots.
2.  **Configuration**: User selects the desired number of test cases (3-20) and sets a starting ID.
3.  **Processing**: The application sends this data to the Gemini API.
4.  **Review**: Generated test cases appear in an interactive table.
5.  **Refinement (Optional)**: User asks the AI Assistant to make specific changes.
6.  **Export**: User clicks "Export to Excel" to download the final report.

---

## Scalability & Future Roadmap

-   **Backend Integration**: Optional addition of a Node.js/Python backend for centralized API key management and user authentication.
-   **JIRA Integration**: Direct pushing of test cases to JIRA/Zephyr.
-   **Custom Models**: Fine-tuning the AI model on specific company guidelines.
