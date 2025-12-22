import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Play, Copy, Trash2, ChevronDown, ChevronUp, Check, FileText, FileJson, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFeatureFromCSV, generateJsonFromFeature } from '../utils/aiService';
import { SAMPLE_CSV, SAMPLE_FEATURE, SAMPLE_JSON } from '../utils/sampleData';

const FeatureCard = ({ item, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const [jsonExpanded, setJsonExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isGeneratingJson, setIsGeneratingJson] = useState(false);
    const [jsonData, setJsonData] = useState(null);

    const handleCopy = (e, content) => {
        e.stopPropagation();
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(item.id);
    };

    const handleGenerateJson = async (e) => {
        e.stopPropagation();
        if (jsonData) {
            setJsonExpanded(!jsonExpanded);
            return;
        }

        setIsGeneratingJson(true);
        try {
            const result = await generateJsonFromFeature(item.content, SAMPLE_JSON);
            setJsonData(result);
            setJsonExpanded(true);
            toast.success("JSON Generated Successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate JSON");
        } finally {
            setIsGeneratingJson(false);
        }
    };

    const handleDownloadJson = (e) => {
        e.stopPropagation();
        if (!jsonData) return;
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.fileName.replace('.feature', '.json');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="feature-card glass-panel"
        >
            <div className="card-header" onClick={() => setExpanded(!expanded)}>
                <div className="header-left">
                    <div className="status-dot" />
                    <div className="file-meta">
                        <h3>{item.fileName}</h3>
                        <span className="timestamp">{item.timestamp}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        onClick={handleGenerateJson}
                        className={`action-pill ${jsonData ? 'active' : ''}`}
                        title="Generate/View JSON"
                    >
                        {isGeneratingJson ? <div className="spinner-dots small" /> : <FileJson size={16} />}
                        {jsonData ? "View JSON" : "Generate JSON"}
                    </button>

                    <div className="divider-v" />

                    <button onClick={(e) => handleCopy(e, item.content)} className="icon-btn" title="Copy Feature">
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                    <button onClick={handleDelete} className="icon-btn delete" title="Delete">
                        <Trash2 size={18} />
                    </button>
                    <button className="icon-btn toggle">
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {jsonExpanded && jsonData && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="json-body"
                    >
                        <div className="json-toolbar">
                            <span className="label">JSON Output</span>
                            <div className="actions">
                                <button onClick={(e) => handleCopy(e, JSON.stringify(jsonData, null, 2))} className="tiny-btn">Copy</button>
                                <button onClick={handleDownloadJson} className="tiny-btn">Download</button>
                            </div>
                        </div>
                        <textarea
                            value={JSON.stringify(jsonData, null, 2)}
                            readOnly
                            className="code-editor json-editor"
                            spellCheck="false"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="card-body"
                    >
                        <div className="body-label">Feature Content</div>
                        <textarea
                            value={item.content}
                            readOnly
                            className="code-editor"
                            spellCheck="false"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FeatureFile = () => {
    const [targetData, setTargetData] = useState(null);
    const [targetFileName, setTargetFileName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // History State - Initialize from localStorage
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('featureHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load history", e);
            return [];
        }
    });

    // Save to localStorage whenever history changes
    React.useEffect(() => {
        try {
            localStorage.setItem('featureHistory', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history", e);
        }
    }, [history]);

    const handleTargetUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setTargetFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const csv = XLSX.utils.sheet_to_csv(ws);
            setTargetData(csv);
        };
        reader.readAsBinaryString(file);
    };

    const handleGenerate = async () => {
        if (!targetData) {
            toast.error("Please upload a target Excel/CSV file first.");
            return;
        }

        setIsGenerating(true);
        try {
            const generatedFeature = await generateFeatureFromCSV(
                targetData,
                SAMPLE_CSV,
                SAMPLE_FEATURE
            );

            const newItem = {
                id: Date.now(),
                fileName: targetFileName.replace(/\.[^/.]+$/, "") + ".feature",
                content: generatedFeature,
                timestamp: new Date().toLocaleTimeString()
            };

            setHistory(prev => [newItem, ...prev]);
            toast.success("Feature Generated & Added to History!");
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteItem = (id) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to clear all history?")) {
            setHistory([]);
            toast.info("History cleared.");
        }
    };

    return (
        <div className="input-form-container">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="header-section"
            >
                <h1>Feature File Generator</h1>
                <p>Convert Excel/CSV to Gherkin Feature files with perfect history tracking.</p>
            </motion.div>

            <div className="upload-section">
                <motion.div className="bento-card glass-panel main-upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="card-header-simple">
                        <FileSpreadsheet size={24} className="text-pink-500" />
                        <h3>Upload Target Excel/CSV</h3>
                    </div>
                    <label className="dropzone major">
                        <input type="file" onChange={handleTargetUpload} accept=".xlsx, .xls, .csv" hidden />
                        <div className="dropzone-content">
                            {targetFileName ? (
                                <>
                                    <FileSpreadsheet size={40} className="text-green-400" />
                                    <div className="file-info">
                                        <p className="file-name">{targetFileName}</p>
                                        <p className="sub-text">Ready to process</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Upload size={40} className="icon-placeholder" />
                                    <p>Drop file here</p>
                                </>
                            )}
                        </div>
                    </label>
                </motion.div>
            </div>

            <motion.div
                className="action-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <button
                    onClick={handleGenerate}
                    className="generate-btn"
                    disabled={isGenerating || !targetData}
                >
                    {isGenerating ? (
                        <>
                            <div className="spinner-dots" /> Generating...
                        </>
                    ) : (
                        <>
                            <Play size={20} fill="currentColor" /> Generate Feature File
                        </>
                    )}
                </button>
            </motion.div>

            {/* History Section */}
            {history.length > 0 && (
                <div className="history-section">
                    <div className="history-header">
                        <h2>Generated History ({history.length})</h2>
                        <button onClick={handleClearAll} className="clear-all-btn">
                            Clear All
                        </button>
                    </div>
                    <div className="history-list">
                        <AnimatePresence>
                            {history.map(item => (
                                <FeatureCard key={item.id} item={item} onDelete={handleDeleteItem} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <style>{`
                .input-form-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 2rem;
                    padding-bottom: 6rem;
                }
                .header-section {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                .header-section h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    background: var(--accent-gradient-text);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .header-section p { color: var(--text-muted); }

                .upload-section { margin-bottom: 2rem; }

                .bento-card {
                    padding: 1.5rem;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .glass-panel { box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px); }

                .card-header-simple {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 1rem;
                    color: white;
                }
                .card-header-simple h3 { font-size: 1.1rem; font-weight: 600; margin: 0; }

                .dropzone {
                    border: 2px dashed rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: rgba(0, 0, 0, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .dropzone:hover { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.05); }
                .dropzone.major { min-height: 180px; }
                .dropzone-content { text-align: center; }
                .file-name { font-weight: 600; color: white; margin-top: 0.5rem; }
                .text-muted { color: rgba(255,255,255,0.4); }

                .action-section { display: flex; justify-content: center; margin-bottom: 3rem; }
                .generate-btn {
                    background: white;
                    color: black;
                    padding: 1rem 3rem;
                    border-radius: 12px;
                    border: none;
                    font-weight: 600;
                    font-size: 1.1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
                }
                .generate-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
                }
                .generate-btn:disabled { opacity: 0.6; cursor: wait; }

                /* History List Styles */
                .history-section { margin-top: 2rem; }
                .history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding: 0 0.5rem;
                }
                .history-header h2 { font-size: 1.5rem; font-weight: 600; color: white; margin: 0; }
                .clear-all-btn {
                    background: rgba(255, 0, 0, 0.1);
                    color: #ff6b6b;
                    border: 1px solid rgba(255, 0, 0, 0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .clear-all-btn:hover { background: rgba(255, 0, 0, 0.2); }

                .history-list { display: flex; flex-direction: column; gap: 1rem; }

                .feature-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: background 0.2s;
                }
                .feature-card:hover { background: rgba(255, 255, 255, 0.05); }

                .card-header {
                    padding: 1.25rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                }
                .header-left { display: flex; align-items: center; gap: 1rem; }
                .status-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 10px #4ade80; }
                .file-meta h3 { margin: 0; font-size: 1.1rem; color: white; font-weight: 500; }
                .timestamp { font-size: 0.8rem; color: rgba(255,255,255,0.4); }

                .header-actions { display: flex; align-items: center; gap: 0.75rem; }
                
                .divider-v {
                    width: 1px;
                    height: 24px;
                    background: rgba(255,255,255,0.1);
                    margin: 0 8px;
                }

                .action-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(139, 92, 246, 0.1);
                    color: #a78bfa;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-pill:hover { background: rgba(139, 92, 246, 0.2); transform: translateY(-1px); }
                .action-pill.active { background: #8b5cf6; color: white; }

                .icon-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.6);
                    padding: 6px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                }
                .icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }
                .icon-btn.delete:hover { color: #ff6b6b; background: rgba(255, 0, 0, 0.1); }
                
                .card-body, .json-body {
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: rgba(0,0,0,0.2);
                }
                
                .body-label {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.4);
                    padding: 0.5rem 1.5rem;
                    background: rgba(0,0,0,0.2);
                    letter-spacing: 0.05em;
                }

                .code-editor {
                    width: 100%;
                    min-height: 200px;
                    background: transparent;
                    color: #ddd;
                    font-family: 'Fira Code', monospace;
                    font-size: 0.9rem;
                    padding: 1.5rem;
                    border: none;
                    outline: none;
                    resize: vertical;
                    display: block;
                }
                
                .json-editor {
                    color: #a5b4fc;
                }

                .json-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 1.5rem;
                    background: rgba(139, 92, 246, 0.05);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .json-toolbar .label { font-size: 0.85rem; font-weight: 600; color: #a78bfa; }
                .json-toolbar .actions { display: flex; gap: 8px; }
                .tiny-btn {
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .tiny-btn:hover { background: rgba(255,255,255,0.1); }

                .spinner-dots {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(0,0,0,0.1);
                    border-left-color: black;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .spinner-dots.small {
                    width: 14px;
                    height: 14px;
                    border-left-color: currentColor;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default FeatureFile;
