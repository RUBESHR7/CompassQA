import React, { useState } from 'react';
import { generateStepDefs } from '../utils/aiService';
import { Loader, Copy, Check, ArrowLeft, Code, FileCode, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const StepDefGenerator = () => {
  const [featureText, setFeatureText] = useState('');
  const [pythonCode, setPythonCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!featureText.trim()) return;
    setLoading(true);
    try {
      const result = await generateStepDefs(featureText);
      setPythonCode(result);
    } catch (error) {
      console.error(error);
      alert('Failed to generate step definitions');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="input-form-container">
      <button className="back-link" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="header-section"
      >
        <h1>Step Definition Generator</h1>
        <p>Transform Gherkin Features into Python Selenium Step Definitions instantly.</p>
      </motion.div>

      <div className="bento-grid two-column">
        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bento-card glass-panel input-card"
        >
          <div className="card-header">
            <div className="icon-wrapper"><FileCode size={20} /></div>
            <h3>Feature File Content</h3>
          </div>

          <div className="editor-container">
            <textarea
              placeholder="Paste your Gherkin Feature here...
Example:
Feature: Login
  Scenario: Successful Login
    Given user is on login page
    When user enters valid credentials
    Then user is redirected to dashboard"
              value={featureText}
              onChange={(e) => setFeatureText(e.target.value)}
              spellCheck="false"
            />
          </div>

          <div className="card-footer">
            <button
              className="btn-generate full-width"
              onClick={handleGenerate}
              disabled={loading || !featureText.trim()}
            >
              {loading ? (
                <><Loader className="spin" size={20} /> Generating...</>
              ) : (
                <><Play size={20} fill="currentColor" /> Generate Python Code</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Output Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bento-card glass-panel output-card"
        >
          <div className="card-header space-between">
            <div className="flex-header">
              <div className="icon-wrapper"><Code size={20} /></div>
              <h3>generated_steps.py</h3>
            </div>
            {pythonCode && (
              <button className="icon-btn" onClick={handleCopy} title="Copy Code">
                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
            )}
          </div>

          <div className="code-editor-wrapper">
            {pythonCode ? (
              <pre className="code-content">
                <code>{pythonCode}</code>
              </pre>
            ) : (
              <div className="empty-state">
                <Code size={48} className="text-muted" />
                <p>Generated Python code will appear here</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
                .input-form-container {
                    max-width: 1400px; /* Wider for side-by-side */
                    margin: 0 auto;
                    padding: 2rem;
                }

                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    margin-bottom: 2rem;
                    transition: color 0.2s;
                    font-size: 0.95rem;
                }

                .back-link:hover {
                    color: white;
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .header-section h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    background: var(--accent-gradient-text);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-section p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                .bento-grid.two-column {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    height: calc(100vh - 250px);
                    min-height: 600px;
                }

                .bento-card {
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    overflow: hidden;
                }

                .glass-panel {
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 1rem;
                    flex-shrink: 0;
                }

                .card-header.space-between {
                    justify-content: space-between;
                }

                .flex-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .card-header h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                }

                .icon-wrapper {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 8px;
                    border-radius: 8px;
                    color: #8b5cf6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Editors */
                .editor-container, .code-editor-wrapper {
                    flex: 1;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .editor-container textarea {
                    flex: 1;
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    border: none;
                    padding: 1rem;
                    color: #e2e8f0;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.9rem;
                    resize: none;
                    outline: none;
                    line-height: 1.5;
                }

                .editor-container textarea::placeholder {
                    color: rgba(255, 255, 255, 0.2);
                }

                .code-content {
                    margin: 0;
                    padding: 1rem;
                    overflow: auto;
                    height: 100%;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.9rem;
                    color: #a5b4fc;
                    line-height: 1.5;
                }

                .empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.3);
                    gap: 1rem;
                }

                .text-muted {
                    color: rgba(255, 255, 255, 0.2);
                }

                /* Actions */
                .card-footer {
                    margin-top: 1rem;
                    flex-shrink: 0;
                }

                .btn-generate {
                    background: white;
                    color: black;
                    padding: 12px;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .btn-generate:hover:not(:disabled) {
                    background: #f0f0f0;
                    transform: translateY(-2px);
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
                }

                .btn-generate:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-generate.full-width {
                    width: 100%;
                }

                .icon-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    padding: 8px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 1024px) {
                    .bento-grid.two-column {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                    
                    .input-card, .output-card {
                        min-height: 500px;
                    }
                }
            `}</style>
    </div>
  );
};

export default StepDefGenerator;
