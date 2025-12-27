import React, { useState, useEffect } from 'react';
import { analyzeFeatureToJson } from '../utils/aiService';
import ChatAssistant from './ChatAssistant';
import { Loader, Copy, Check, ArrowLeft, FileJson, Braces, Play, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const HistoryCard = ({ item, onDelete, onLoad }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(item.output, null, 2));
    setCopied(true);
    toast.success("JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="history-card glass-panel"
    >
      <div className="card-header-history" onClick={() => setExpanded(!expanded)}>
        <div className="header-left">
          <div className="status-dot" />
          <div className="file-meta">
            <h3>Analysis Result</h3>
            <span className="timestamp">{item.timestamp}</span>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={(e) => { e.stopPropagation(); onLoad(item); }} className="action-pill">
            Load
          </button>
          <div className="divider-v" />
          <button onClick={handleCopy} className="icon-btn" title="Copy JSON">
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="icon-btn delete" title="Delete">
            <Trash2 size={18} />
          </button>
          <button className="icon-btn toggle">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="history-body"
          >
            <div className="preview-label">Feature Input</div>
            <div className="preview-content">{item.input.substring(0, 100)}...</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const JsonAnalyzer = () => {
  const [featureText, setFeatureText] = useState('');
  const [jsonOutput, setJsonOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // History State
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('jsonAnalyzerHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('jsonAnalyzerHistory', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async () => {
    if (!featureText.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeFeatureToJson(featureText);
      setJsonOutput(result);

      // Add to History
      const newItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        input: featureText,
        output: result
      };
      setHistory(prev => [newItem, ...prev]);
      toast.success("Analysis Complete & Saved");

    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze feature file');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleLoadItem = (item) => {
    setFeatureText(item.input);
    setJsonOutput(item.output);
    toast.success("Loaded from history");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all history?")) {
      setHistory([]);
      toast.info("History cleared");
    }
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
        <h1>Feature File Analyzer</h1>
        <p>Parse your Gherkin content into structured JSON data instantly.</p>
      </motion.div>

      <div className="bento-grid two-column">
        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bento-card glass-panel input-card"
        >
          <div className="card-header">
            <div className="icon-wrapper"><FileJson size={20} /></div>
            <h3>Feature File Content</h3>
          </div>

          <div className="editor-container">
            <textarea
              placeholder="Paste your Gherkin Feature here..."
              value={featureText}
              onChange={(e) => setFeatureText(e.target.value)}
              spellCheck="false"
            />
          </div>

          <div className="card-footer">
            <button
              className="btn-generate full-width"
              onClick={handleAnalyze}
              disabled={loading || !featureText.trim()}
            >
              {loading ? (
                <><Loader className="spin" size={20} /> Analyzing...</>
              ) : (
                <><Play size={20} fill="currentColor" /> Convert to JSON</>
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
              <div className="icon-wrapper"><Braces size={20} /></div>
              <h3>JSON Output</h3>
            </div>
            {jsonOutput && (
              <button className="icon-btn" onClick={handleCopy} title="Copy JSON">
                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
            )}
          </div>

          <div className="code-editor-wrapper">
            {jsonOutput ? (
              <pre className="code-content">
                <code>{JSON.stringify(jsonOutput, null, 2)}</code>
              </pre>
            ) : (
              <div className="empty-state">
                <Braces size={48} className="text-muted" />
                <p>JSON output will appear here</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ChatAssistant
        contextData={jsonOutput}
        contextType="json-analysis"
        onUpdate={(newJson) => {
          setJsonOutput(newJson);
          toast.success("JSON updated by AI");
        }}
      />

      {/* History Section */}
      {history.length > 0 && (
        <div className="history-section-wrapper">
          <div className="history-header">
            <h2>History ({history.length})</h2>
            <button onClick={handleClearAll} className="clear-all-btn">Clear All</button>
          </div>
          <div className="history-list">
            <AnimatePresence>
              {history.map(item => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteItem}
                  onLoad={handleLoadItem}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <style>{`
                .input-form-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                    padding-bottom: 6rem;
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
                    height: calc(100vh - 350px); /* Adjusted for history */
                    min-height: 500px;
                    margin-bottom: 3rem;
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
                .icon-btn.delete:hover { background: rgba(255, 0, 0, 0.1); color: #ff6b6b; }
                .icon-btn:hover { background: rgba(255, 255, 255, 0.2); }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* History Styles */
                .history-section-wrapper {
                    margin-top: 3rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 2rem;
                }
                .history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .history-header h2 { color: white; font-size: 1.5rem; }
                .clear-all-btn {
                    background: rgba(255,0,0,0.1);
                    color: #ff6b6b;
                    border: 1px solid rgba(255,0,0,0.2);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .history-list { display: flex; flex-direction: column; gap: 1rem; }
                
                .history-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    overflow: hidden;
                }
                .card-header-history {
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                }
                .header-left { display: flex; align-items: center; gap: 1rem; }
                .status-dot { width: 8px; height: 8px; background: #a855f7; border-radius: 50%; box-shadow: 0 0 10px #a855f7; }
                .file-meta h3 { margin: 0; color: white; }
                .timestamp { font-size: 0.8rem; color: rgba(255,255,255,0.4); }
                .header-actions { display: flex; align-items: center; gap: 8px; }
                
                .action-pill {
                    background: rgba(139, 92, 246, 0.1);
                    color: #a78bfa;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    cursor: pointer;
                }
                .action-pill:hover { background: rgba(139, 92, 246, 0.2); color: white; }
                .divider-v { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 4px; }
                
                .history-body {
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: rgba(0,0,0,0.2);
                    padding: 1rem 1.5rem;
                }
                .preview-label { font-size: 0.75rem; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 0.5rem; }
                .preview-content { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #94a3b8; }

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

export default JsonAnalyzer;
