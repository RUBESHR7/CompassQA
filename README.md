# Compass QA - Next.js Migration

Welcome to the new and improved Compass QA! We've migrated the entire project from Vite to **Next.js** for better performance, built-in API routes, and a more robust development experience.

## 🚀 Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Ensure you have your API keys in a `.env` file at the root:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_key
    VITE_MISTRAL_API_KEY=your_mistral_key
    ```
    *(Note: We kept the `VITE_` prefix for compatibility with existing env files, but Next.js reads these on the server side via `process.env`.)*

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Build for Production:**
    ```bash
    npm run build
    npm start
    ```

## 🏗️ Project Structure

-   `/app`: Next.js App Router pages and API routes.
-   `/components`: Reusable React components (now optimized with `"use client"` where necessary).
-   `/utils`: Core logic for AI services and Excel generation.
-   `/public`: Static assets.

## ✨ Key Changes

-   **No More Separate Backend:** The Express.js server has been replaced by Next.js API Routes (`/app/api/ai/chat/route.js`).
-   **Navigation:** Transitioned from `react-router-dom` to the Next.js App Router for seamless routing.
-   **Styling:** Consolidated into `app/globals.css` using CSS Variables for a premium dark theme.
-   **Font Optimization:** Using `next/font` for Inter and Outfit typefaces.

Enjoy the future of test automation!
