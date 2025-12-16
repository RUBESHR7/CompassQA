import React, { useState } from 'react';
import { analyzeFeatureToJson } from '../utils/aiService';
import { Loader, Copy, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JsonAnalyzer = () => {
    const [featureText, setFeatureText] = useState('');
    const [jsonOutput, setJsonOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        if (!featureText.trim()) return;
        setLoading(true);
        try {
            const result = await analyzeFeatureToJson(featureText);
            setJsonOutput(result);
        } catch (error) {
            console.error(error);
            alert('Failed to analyze feature file');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="tool-container">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="header">
                <h1>Feature File Analyzer</h1>
                <p>Parse your Gherkin content into structured JSON data.</p>
            </div>

            <div className="content-grid">
                <div className="input-section">
                    <h3>Paste Feature File</h3>
                    <textarea
                        placeholder="Feature: Login..."
                        value={featureText}
                        onChange={(e) => setFeatureText(e.target.value)}
                    />
                    <button
                        className="generate-btn"
                        onClick={handleAnalyze}
                        disabled={loading || !featureText.trim()}
                    >
                        {loading ? <><Loader className="spin" size={18} /> Analyzing...</> : 'Convert to JSON'}
                    </button>
                </div>

                <div className="output-section">
                    <div className="output-header">
                        <h3>JSON Output</h3>
                        {jsonOutput && (
                            <button className="copy-btn" onClick={handleCopy}>
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied!' : 'Copy JSON'}
                            </button>
                        )}
                    </div>
                    <pre className="code-block">
                        {jsonOutput ? JSON.stringify(jsonOutput, null, 2) : "// JSON output will appear here..."}
                    </pre>
                </div>
            </div>

            <style>{`
        .tool-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }

        .back-btn:hover {
          color: white;
        }

        .header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .input-section, .output-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .input-section textarea {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          color: white;
          min-height: 400px;
          resize: none;
          margin: 1rem 0;
          font-family: monospace;
        }

        .generate-btn {
          background: var(--accent-gradient);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s;
        }

        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .output-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .code-block {
          background: #1e1e24;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          flex: 1;
          font-family: monospace;
          color: #a5b4fc;
          white-space: pre-wrap;
        }

        .copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default JsonAnalyzer;
