import React from 'react';
import { Book, Code, FileText, Zap, Shield, Layers, History, Image, Bell } from 'lucide-react';

const Documentation = () => {
  return (
    <div className="docs-container">
      <div className="docs-content">
        <div className="docs-header">
          <h1 className="docs-title">
            <span className="text-gradient">Documentation</span>
          </h1>
          <p className="docs-subtitle">
            Everything you need to know about using Compass QA to generate comprehensive test cases.
          </p>
        </div>

        <div className="docs-grid">
          <section className="docs-section">
            <div className="section-icon">
              <Zap size={24} />
            </div>
            <h2>Getting Started</h2>
            <p>
              Compass QA uses advanced AI to analyze your user stories and screenshots.
              Simply paste your user story, upload relevant screenshots, and click "Generate Test Cases".
            </p>
            <ul className="feature-list">
              <li>Paste User Story</li>
              <li>Upload Screenshots (Drag & Drop or Paste)</li>
              <li><strong>Preview Images</strong> by clicking thumbnails</li>
              <li>Select Number of Cases</li>
              <li>Generate & Export</li>
            </ul>
          </section>

          <section className="docs-section">
            <div className="section-icon">
              <History size={24} />
            </div>
            <h2>History & Persistence</h2>
            <p>
              Never lose your work again. Compass QA automatically saves your generated test cases.
            </p>
            <ul className="feature-list">
              <li><strong>Auto-Save</strong>: Your current work is saved to local storage.</li>
              <li><strong>History Tab</strong>: View and restore previous generations.</li>
              <li><strong>Refresh Protection</strong>: Data persists even if you reload the page.</li>
            </ul>
          </section>

          <section className="docs-section">
            <div className="section-icon">
              <Image size={24} />
            </div>
            <h2>Image Features</h2>
            <p>
              Enhanced image handling for better context.
            </p>
            <ul className="feature-list">
              <li><strong>Smart Preview</strong>: Click any uploaded thumbnail to view it in full size.</li>
              <li><strong>Clipboard Support</strong>: Paste images directly from your clipboard (Ctrl+V).</li>
              <li><strong>Drag & Drop</strong>: Easily manage multiple screenshots.</li>
            </ul>
          </section>

          <section className="docs-section">
            <div className="section-icon">
              <Layers size={24} />
            </div>
            <h2>Test Case Structure</h2>
            <p>
              Generated test cases follow a standard industry format compatible with most test management tools.
            </p>
            <div className="code-block">
              <code>
                ID | Description | Pre-conditions | Steps | Expected Result
              </code>
            </div>
          </section>

          <section className="docs-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-icon">
              <Code size={24} />
            </div>
            <h2>Technical Architecture</h2>
            <p>
              Compass QA is built with modern web technologies to ensure performance and reliability.
            </p>

            <div className="tech-grid">
              <div className="tech-item">
                <h3>Core AI Engine</h3>
                <p>Powered by <strong>Google Gemini API</strong> (gemini-1.5-flash) for high-speed, accurate natural language processing and image analysis.</p>
              </div>

              <div className="tech-item">
                <h3>Frontend Framework</h3>
                <p>Built with <strong>React 19</strong> and <strong>Vite</strong> for a fast, reactive user experience.</p>
              </div>

              <div className="tech-item">
                <h3>Key Libraries</h3>
                <ul className="tech-list">
                  <li><strong>react-router-dom</strong>: Seamless client-side routing.</li>
                  <li><strong>sonner</strong>: Beautiful, responsive toast notifications.</li>
                  <li><strong>@google/generative-ai</strong>: Direct integration with Gemini models.</li>
                  <li><strong>exceljs</strong>: Professional-grade Excel file generation.</li>
                  <li><strong>lucide-react</strong>: Beautiful, consistent iconography.</li>
                </ul>
              </div>

              <div className="tech-item">
                <h3>Features</h3>
                <ul className="tech-list">
                  <li><strong>LocalStorage</strong>: Client-side data persistence.</li>
                  <li><strong>Code Splitting</strong>: Optimized performance with React.lazy.</li>
                  <li><strong>Modern CSS</strong>: CSS Variables and Glassmorphism design.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .docs-container {
          padding: var(--spacing-xl);
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .docs-header {
          text-align: center;
          margin-bottom: var(--spacing-3xl);
        }

        .docs-title {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          letter-spacing: -0.02em;
        }

        .docs-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-xl);
        }

        .docs-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          transition: all var(--transition-normal);
        }

        .docs-section:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
        }

        .section-icon {
          background: rgba(139, 92, 246, 0.1);
          color: var(--accent-primary);
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--spacing-lg);
        }

        .docs-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: var(--spacing-md);
          color: var(--text-primary);
        }

        .docs-section p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--spacing-lg);
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
          margin-top: var(--spacing-lg);
        }

        .tech-item h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .tech-list {
          list-style: none;
          padding: 0;
        }

        .tech-list li {
          color: var(--text-secondary);
          margin-bottom: 4px;
          font-size: 0.95rem;
        }

        .tech-list strong {
          color: var(--accent-primary);
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .feature-list li::before {
          content: "•";
          color: var(--accent-primary);
          font-weight: bold;
        }

        .code-block {
          background: rgba(0, 0, 0, 0.3);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-family: monospace;
          font-size: 0.875rem;
          color: var(--text-muted);
          overflow-x: auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .docs-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Documentation;
