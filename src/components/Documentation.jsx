import React from 'react';
import { Book, Code, FileText, Zap, Shield, Layers } from 'lucide-react';

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
                            <li>Upload Screenshots (Optional)</li>
                            <li>Select Number of Cases</li>
                            <li>Generate & Export</li>
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

                    <section className="docs-section">
                        <div className="section-icon">
                            <Shield size={24} />
                        </div>
                        <h2>Best Practices</h2>
                        <p>
                            For the best results, provide clear and detailed user stories.
                            Screenshots help the AI understand the UI context and generate more accurate steps.
                        </p>
                    </section>

                    <section className="docs-section">
                        <div className="section-icon">
                            <FileText size={24} />
                        </div>
                        <h2>Exporting</h2>
                        <p>
                            Once generated, you can review the test cases in the results view.
                            Click "Export to Excel" to download a .xlsx file formatted for immediate use.
                        </p>
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
