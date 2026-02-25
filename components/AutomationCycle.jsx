"use client";
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Play, Copy, Trash2, ChevronDown, ChevronUp, Check, FileText, Download, Terminal, Settings, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFeatureFromCSV, generateStepDefs } from '../utils/aiService';
import { SAMPLE_CSV, SAMPLE_FEATURE } from '../utils/sampleData';
import ChatAssistant from './ChatAssistant';

const AutomationResults = ({ feature, fileName, onReset, onUpdate, initialStepDefs }) => {
    const [stepDefs, setStepDefs] = useState(initialStepDefs || null);
    const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);
    const [copiedFeature, setCopiedFeature] = useState(false);
    const [copiedSteps, setCopiedSteps] = useState(false);

    const handleCopy = (content, setCopied) => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerateSteps = async () => {
        setIsGeneratingSteps(true);
        try {
            const result = await generateStepDefs(feature);
            setStepDefs(result);
            toast.success("Step Definitions Generated!");

            // Update history with step defs
            const savedHistory = localStorage.getItem('automation_history');
            if (savedHistory) {
                let history = JSON.parse(savedHistory);
                const updatedHistory = history.map(item =>
                    item.feature === feature ? { ...item, stepDefs: result } : item
                );
                localStorage.setItem('automation_history', JSON.stringify(updatedHistory));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate steps");
        } finally {
            setIsGeneratingSteps(false);
        }
    };

    const handleDownload = (content, name, ext) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name.replace(/\.[^/.]+$/, "") + ext;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="results-container">
            <div className="results-header">
                <button onClick={onReset} className="back-btn">
                    <ArrowLeft size={18} /> Back to Upload
                </button>
                <div className="header-info">
                    <h2>{fileName}</h2>
                    <p>Generated Feature File & Automation Scripts</p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={handleGenerateSteps}
                        className="action-btn primary"
                        disabled={isGeneratingSteps}
                    >
                        {isGeneratingSteps ? <RefreshCw className="spin" size={18} /> : <Terminal size={18} />}
                        {stepDefs ? "Regenerate Steps" : "Generate Step Definitions"}
                    </button>
                </div>
            </div>

            <div className="preview-grid">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="preview-card"
                >
                    <div className="card-toolbar">
                        <div className="toolbar-left">
                            <FileText size={18} className="text-pink-500" />
                            <span>Gherkin Feature File</span>
                        </div>
                        <div className="toolbar-right">
                            <button onClick={() => handleCopy(feature, setCopiedFeature)} className="tool-btn">
                                {copiedFeature ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            <button onClick={() => handleDownload(feature, fileName, ".feature")} className="tool-btn">
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="code-container">
                        <textarea
                            value={feature}
                            onChange={(e) => onUpdate(e.target.value)}
                            className="preview-editor"
                            spellCheck="false"
                        />
                        <div className="editor-footer">
                            <ChatAssistant
                                contextData={feature}
                                contextType="gherkin"
                                onUpdate={onUpdate}
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="preview-card"
                >
                    <div className="card-toolbar">
                        <div className="toolbar-left">
                            <Terminal size={18} className="text-green-500" />
                            <span>Step Definitions (Python)</span>
                        </div>
                        <div className="toolbar-right">
                            {stepDefs && (
                                <>
                                    <button onClick={() => handleCopy(stepDefs, setCopiedSteps)} className="tool-btn">
                                        {copiedSteps ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                    <button onClick={() => handleDownload(stepDefs, fileName, "_steps.py")} className="tool-btn">
                                        <Download size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="code-container empty">
                        {isGeneratingSteps ? (
                            <div className="gen-loading">
                                <div className="spinner-dots" />
                                <p>Analyzing feature file and generating perfect step definitions...</p>
                            </div>
                        ) : stepDefs ? (
                            <textarea
                                value={stepDefs}
                                readOnly
                                className="preview-editor python"
                                spellCheck="false"
                            />
                        ) : (
                            <div className="placeholder-msg">
                                <Terminal size={40} className="mb-4 opacity-20" />
                                <p>Click "Generate Step Definitions" to create automation scripts for this feature.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <style>{`
                .results-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
                .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; gap: 2rem; }
                .back-btn { display: flex; align-items: center; gap: 8px; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
                .back-btn:hover { background: rgba(255,255,255,0.05); color: white; }
                .header-info h2 { font-size: 1.5rem; margin-bottom: 4px; }
                .header-info p { color: var(--text-muted); font-size: 0.9rem; }
                .action-btn.primary { background: white; color: black; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
                .action-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(255,255,255,0.2); }
                .action-btn.primary:disabled { opacity: 0.6; cursor: wait; }

                .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; height: calc(100vh - 250px); min-height: 600px; }
                .preview-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
                .card-toolbar { background: rgba(0,0,0,0.2); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .toolbar-left { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 0.95rem; }
                .toolbar-right { display: flex; gap: 8px; }
                .tool-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
                .tool-btn:hover { background: rgba(255,255,255,0.1); color: white; }

                .code-container { flex: 1; position: relative; display: flex; flex-direction: column; }
                .preview-editor { flex: 1; width: 100%; background: transparent; border: none; outline: none; padding: 20px; color: #ddd; font-family: 'Fira Code', monospace; font-size: 0.9rem; resize: none; line-height: 1.6; }
                .preview-editor.python { color: #4ade80; }
                .editor-footer { border-top: 1px solid rgba(255,255,255,0.05); }

                .gen-loading, .placeholder-msg { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 3rem; color: var(--text-muted); }
                .placeholder-msg p { max-width: 250px; line-height: 1.5; }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const AutomationCycle = () => {
    const [targetData, setTargetData] = useState(null);
    const [targetFileName, setTargetFileName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedFeature, setGeneratedFeature] = useState(null);
    const [initialStepDefs, setInitialStepDefs] = useState(null);

    useEffect(() => {
        const temp = localStorage.getItem('automation_temp_view');
        if (temp) {
            try {
                const item = JSON.parse(temp);
                setGeneratedFeature(item.feature);
                setTargetFileName(item.fileName);
                setInitialStepDefs(item.stepDefs);
                localStorage.removeItem('automation_temp_view');
            } catch (e) {
                console.error("Failed to load temp view", e);
            }
        }
    }, []);

    const handleTargetUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.name.endsWith('.feature')) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const content = evt.target.result;
                setGeneratedFeature(content);
                setTargetFileName(file.name);
                setInitialStepDefs(null);
                saveToHistory(file.name, content);
            };
            reader.readAsText(file);
            return;
        }

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

    const saveToHistory = (fileName, content, stepDefs = null) => {
        const savedHistory = localStorage.getItem('automation_history');
        let history = savedHistory ? JSON.parse(savedHistory) : [];
        const newItem = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            fileName,
            feature: content,
            stepDefs
        };
        history = [newItem, ...history];
        localStorage.setItem('automation_history', JSON.stringify(history));
    };

    const handleGenerate = async () => {
        if (!targetData) {
            toast.error("Please upload a target Excel/CSV file first.");
            return;
        }

        setIsGenerating(true);
        try {
            const generated = await generateFeatureFromCSV(
                targetData,
                SAMPLE_CSV,
                SAMPLE_FEATURE
            );

            const finalFileName = targetFileName.replace(/\.[^/.]+$/, "") + ".feature";
            setGeneratedFeature(generated);
            setInitialStepDefs(null);
            saveToHistory(finalFileName, generated);
            toast.success("Feature File Generated!");
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    if (generatedFeature) {
        return (
            <AutomationResults
                feature={generatedFeature}
                fileName={targetFileName.replace(/\.[^/.]+$/, "") + ".feature"}
                initialStepDefs={initialStepDefs}
                onReset={() => {
                    setGeneratedFeature(null);
                    setTargetFileName('');
                    setTargetData(null);
                    setInitialStepDefs(null);
                }}
                onUpdate={setGeneratedFeature}
            />
        );
    }

    return (
        <div className="input-form-container">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="header-section"
            >
                <h1>Automation Cycle</h1>
                <p>Upload Excel to generate Feature Files, then create Step Definitions.</p>
            </motion.div>

            <div className="upload-section">
                <motion.div className="bento-card glass-panel main-upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="card-header-simple">
                        <FileSpreadsheet size={24} className="text-pink-500" />
                        <h3>Upload Excel/CSV or Feature File</h3>
                    </div>
                    <label className="dropzone major">
                        <input type="file" onChange={handleTargetUpload} accept=".xlsx, .xls, .csv, .feature" hidden />
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

            <style>{`
                .input-form-container { max-width: 900px; margin: 0 auto; padding: 2rem; padding-bottom: 6rem; }
                .header-section { text-align: center; margin-bottom: 2.5rem; }
                .header-section h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; background: var(--accent-gradient-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .header-section p { color: var(--text-muted); }
                .upload-section { margin-bottom: 2rem; }
                .bento-card { padding: 1.5rem; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); }
                .glass-panel { box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px); }
                .card-header-simple { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; color: white; }
                .card-header-simple h3 { font-size: 1.1rem; font-weight: 600; margin: 0; }
                .dropzone { border: 2px dashed rgba(255, 255, 255, 0.2); border-radius: 12px; cursor: pointer; transition: all 0.2s; background: rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center; }
                .dropzone:hover { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.05); }
                .dropzone.major { min-height: 180px; }
                .dropzone-content { text-align: center; }
                .file-name { font-weight: 600; color: white; margin-top: 0.5rem; }
                .action-section { display: flex; justify-content: center; margin-bottom: 3rem; }
                .generate-btn { background: white; color: black; padding: 1rem 3rem; border-radius: 12px; border: none; font-weight: 600; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s; box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
                .generate-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 30px rgba(255, 255, 255, 0.2); }
                .generate-btn:disabled { opacity: 0.6; cursor: wait; }
                .spinner-dots { width: 20px; height: 20px; border: 2px solid rgba(0,0,0,0.1); border-left-color: black; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AutomationCycle;
