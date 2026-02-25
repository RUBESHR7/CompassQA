/**
 * Compass QA - Project Knowledge Store
 * 
 * This module acts as a "codebase awareness" engine — like GitHub Copilot.
 * It stores and retrieves generated content (test cases, feature files, step defs)
 * to provide accurate context for future generations.
 * 
 * When you generate a feature file for "Login Page", this store remembers:
 * - The exact login steps used
 * - The navigation path to reach a page
 * - The page names, locator patterns, and component imports used
 * 
 * On the next generation for a related page, all this context is automatically
 * injected into the AI prompt, resulting in 100% consistent, accurate output.
 */

const STORE_KEY = 'compass_qa_knowledge_store';

/**
 * Save a generated artifact to the knowledge store.
 * @param {'test-case' | 'feature' | 'step-def'} type - The type of artifact
 * @param {string} content - The generated content (string or JSON)
 * @param {string} source - The source/title (user story summary or filename)
 */
export const saveToKnowledgeStore = (type, content, source) => {
    if (typeof window === 'undefined') return;

    const store = getKnowledgeStore();
    const id = `${type}_${Date.now()}`;

    const entry = {
        id,
        type,
        source,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        date: new Date().toISOString(),
        // Extract key patterns for quick retrieval
        patterns: extractPatterns(type, content)
    };

    // Keep the last 50 entries to avoid storage bloat
    store.entries = [entry, ...store.entries].slice(0, 50);
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
};

/**
 * Retrieve the most relevant past generations for a new generation request.
 * Searches by keyword matching in the source and patterns.
 * @param {string} query - The new user story or filename being generated
 * @param {string[]} types - Types to filter ('feature', 'step-def', 'test-case')
 * @returns {string} - Formatted context string to inject into AI prompt
 */
export const retrieveRelevantContext = (query, types = ['feature', 'step-def']) => {
    if (typeof window === 'undefined') return "";

    const store = getKnowledgeStore();
    if (!store.entries.length) return "";

    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    const scored = store.entries
        .filter(e => types.includes(e.type))
        .map(entry => {
            let score = 0;
            const entryText = `${entry.source} ${entry.patterns.join(' ')}`.toLowerCase();
            queryWords.forEach(word => {
                if (entryText.includes(word)) score += 1;
            });
            // Bonus for same type
            return { ...entry, score };
        })
        .filter(e => e.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Top 3 most relevant

    if (!scored.length) return "";

    let context = "\n### RELEVANT PAST GENERATIONS (Use these for consistency):\n";

    scored.forEach((entry, idx) => {
        context += `\n--- Reference ${idx + 1}: ${entry.source} (${entry.type}) ---\n`;
        // Truncate to avoid token limits
        const truncated = entry.content.length > 2000
            ? entry.content.substring(0, 2000) + "\n... (truncated)"
            : entry.content;
        context += truncated + "\n";
    });

    context += `\n### CONSISTENCY RULES (derived from past generations):
- Use the SAME login step text as seen in references above.
- Use the SAME navigation paths (e.g., Administration -> Access Management).
- Use the SAME page names, locator variable patterns, and component imports.
- If a step definition function already exists in the references (e.g., login_to_application), DO NOT duplicate it — reference it instead.
`;

    return context;
};

/**
 * Extract key patterns from generated content for smarter retrieval.
 */
const extractPatterns = (type, content) => {
    const patterns = [];
    const text = typeof content === 'string' ? content : JSON.stringify(content);

    if (type === 'feature' || type === 'step-def') {
        // Extract Given/When/Then steps
        const steps = text.match(/(Given|When|Then|And|But)\s+.+/g) || [];
        patterns.push(...steps.slice(0, 10).map(s => s.substring(0, 60)));

        // Extract page names
        const pages = text.match(/[A-Z][a-zA-Z]+Page/g) || [];
        patterns.push(...[...new Set(pages)]);

        // Extract navigation paths
        const navs = text.match(/Administration.*?(Tab|Page|Management)/g) || [];
        patterns.push(...navs.slice(0, 3));
    }

    if (type === 'test-case') {
        try {
            const parsed = JSON.parse(text);
            const cases = parsed.testCases || [];
            cases.forEach(tc => {
                if (tc.summary) patterns.push(tc.summary.substring(0, 60));
            });
        } catch (e) { /* ignore */ }
    }

    return [...new Set(patterns)]; // deduplicate
};

/**
 * Get all knowledge store entries (for display in UI if needed)
 */
export const getKnowledgeStore = () => {
    if (typeof window === 'undefined') return { entries: [] };
    try {
        const raw = localStorage.getItem(STORE_KEY);
        return raw ? JSON.parse(raw) : { entries: [] };
    } catch (e) {
        return { entries: [] };
    }
};

/**
 * Clear the entire knowledge store
 */
export const clearKnowledgeStore = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORE_KEY);
};
