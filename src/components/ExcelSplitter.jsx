import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, FileCode, Play, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFeatureFromCSV } from '../utils/aiService';
// Import reference content as raw text
import referenceFeatures from '../assets/reference_features.txt?raw';

const ExcelSplitter = () => {
    const [originalData, setOriginalData] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [processingId, setProcessingId] = useState(null);
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                setOriginalData(data);
                groupData(data);
            } catch (error) {
                toast.error("Failed to parse Excel file");
                console.error(error);
            }
        };
        reader.readAsBinaryString(file);
    };

    const groupData = (data) => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        // Smart column detection
        const groupKey = headers.find(h => /user story/i.test(h)) ||
            headers.find(h => /folder/i.test(h)) ||
            headers.find(h => /module/i.test(h)) ||
            headers[0];

        const groups = {};
        data.forEach(row => {
            const key = row[groupKey] || 'Uncategorized';
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
        });

        setGroupedData(groups);
        toast.success(`Successfully split into ${Object.keys(groups).length} groups!`);
    };

    const generateFeature = async (groupName) => {
        setProcessingId(groupName);
        try {
            const groupRows = groupedData[groupName];
            const ws = XLSX.utils.json_to_sheet(groupRows);
            const csvOutput = XLSX.utils.sheet_to_csv(ws);

            const featureText = await generateFeatureFromCSV(csvOutput, referenceFeatures);

            const blob = new Blob([featureText], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${groupName.replace(/[^a-z0-9]/gi, '_')}.feature`;
            a.click();

            toast.success(`Feature generated for ${groupName}`);
        } catch (error) {
            console.error(error);
            toast.error(`Generation failed: ${error.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const downloadCSV = (groupName) => {
        const groupRows = groupedData[groupName];
        const ws = XLSX.utils.json_to_sheet(groupRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `${groupName}.csv`);
    };

    return (
        <div className="input-form-container">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="header-section"
            >
                <h1>Excel to Feature</h1>
                <p>Convert your Excel test cases into Gherkin Feature files automatically.</p>
            </motion.div>

            <div className="bento-grid">
                {/* Upload Card */}
                <div className="bento-card upload-card glass-panel">
                    <div className="card-header">
                        <div className="icon-wrapper"><Upload size={20} /></div>
                        <h3>Upload Excel Sheet</h3>
                    </div>

                    <label className="dropzone">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".xlsx, .xls"
                            hidden
                        />
                        <div className="dropzone-content">
                            {fileName ? (
                                <div className="file-info">
                                    <FileSpreadsheet size={48} className="text-green-400 mb-2" />
                                    <p className="file-name">{fileName}</p>
                                    <p className="sub-text">Click to replace</p>
                                </div>
                            ) : (
                                <>
                                    <FileSpreadsheet size={48} className="icon-placeholder" />
                                    <p>Drop Excel file here or <strong>Click to Browse</strong></p>
                                    <p className="sub-text">Supports .xlsx and .xls</p>
                                </>
                            )}
                        </div>
                    </label>
                </div>

                {/* Render Processed Groups */}
                {Object.keys(groupedData).length > 0 && (
                    <div className="results-container">
                        <h2 className="section-title">Detected Features ({Object.keys(groupedData).length})</h2>
                        <div className="features-grid">
                            <AnimatePresence>
                                {Object.entries(groupedData).map(([groupName, rows], index) => (
                                    <motion.div
                                        key={groupName}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bento-card feature-card glass-panel"
                                    >
                                        <div className="card-header space-between">
                                            <div className="flex-header">
                                                <div className="icon-wrapper feature-icon"><FileCode size={18} /></div>
                                                <div className="header-text">
                                                    <h3 title={groupName}>{groupName}</h3>
                                                    <span className="badge">{rows.length} Tests</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                onClick={() => downloadCSV(groupName)}
                                                className="action-btn secondary"
                                                title="Download CSV"
                                            >
                                                <Download size={16} /> CSV
                                            </button>

                                            <button
                                                onClick={() => generateFeature(groupName)}
                                                className="action-btn primary"
                                                disabled={processingId === groupName}
                                            >
                                                {processingId === groupName ? (
                                                    <div className="spinner-dots" />
                                                ) : (
                                                    <>
                                                        <Play size={16} fill="currentColor" /> Generate Feature
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .input-form-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .header-section h1 {
                    font-size: 3rem;
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

                .bento-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .bento-card {
                    padding: 1.5rem;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    transition: transform 0.2s, border-color 0.2s;
                }

                .glass-panel {
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 1.5rem;
                }

                .card-header h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
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

                /* Upload Section */
                .upload-card {
                    max-width: 800px;
                    margin: 0 auto;
                    width: 100%;
                }

                .dropzone {
                    border: 2px dashed rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 3rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: block;
                    background: rgba(0, 0, 0, 0.2);
                }

                .dropzone:hover {
                    border-color: #8b5cf6;
                    background: rgba(139, 92, 246, 0.05);
                }

                .dropzone-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .icon-placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .sub-text {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.5);
                }

                .file-name {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: white;
                }

                /* Results Section */
                .results-container {
                    margin-top: 2rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                    color: white;
                    border-left: 4px solid #8b5cf6;
                    padding-left: 1rem;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .feature-card {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                
                .feature-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(139, 92, 246, 0.4);
                }

                .flex-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    width: 100%;
                }

                .header-text {
                    flex: 1;
                    min-width: 0;
                }

                .badge {
                    display: inline-block;
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-top: 4px;
                }

                .card-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 1rem;
                }

                .action-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }

                .action-btn.primary {
                    background: white;
                    color: black;
                }

                .action-btn.primary:hover {
                    background: #f0f0f0;
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
                }
                
                .action-btn.primary:disabled {
                    opacity: 0.7;
                    cursor: wait;
                }

                .action-btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .action-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .spinner-dots {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(0,0,0,0.1);
                    border-left-color: black;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ExcelSplitter;
