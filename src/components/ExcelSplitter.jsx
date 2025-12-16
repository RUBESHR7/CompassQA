import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, FileCode, Play } from 'lucide-react';
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
        <div className="min-h-screen bg-transparent p-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-600">
                        Excel to Feature
                    </h1>
                    <p className="text-xl text-gray-400">
                        Transform your test cases into Gherkin features automatically.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-12"
                >
                    <label className="relative flex flex-col items-center justify-center w-full h-48 rounded-3xl border-2 border-dashed border-gray-600 bg-gray-900/50 backdrop-blur-sm cursor-pointer overflow-hidden group transition-all duration-300 hover:border-pink-500 hover:bg-gray-800/80">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                            <div className="p-4 rounded-full bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-500 transition-all duration-300 mb-4 shadow-lg group-hover:shadow-pink-500/25">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-white" />
                            </div>
                            <p className="mb-2 text-lg text-gray-300 font-medium">
                                {fileName ? (
                                    <span className="text-pink-400">{fileName}</span>
                                ) : (
                                    <>Drop your Excel file here or <span className="text-pink-400">browse</span></>
                                )}
                            </p>
                            <p className="text-sm text-gray-500">Supports .xlsx and .xls</p>
                        </div>
                        <input type="file" style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleFileUpload} />
                    </label>
                </motion.div>

                {Object.keys(groupedData).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {Object.entries(groupedData).map(([groupName, rows], index) => (
                                <motion.div
                                    key={groupName}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -5 }}
                                    className="group relative bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-gray-900/60 hover:border-pink-500/30 transition-all duration-300 shadow-xl"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1 mr-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                                                    <FileCode size={20} />
                                                </div>
                                                <span className="text-xs font-mono text-pink-400/80 uppercase tracking-wider">User Story</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-white line-clamp-2" title={groupName}>
                                                {groupName}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-bold text-white">{rows.length}</span>
                                            <span className="text-xs text-gray-500">Test Cases</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => downloadCSV(groupName)}
                                            className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
                                            title="Download Raw CSV"
                                        >
                                            <Download size={16} />
                                            <span>CSV</span>
                                        </button>

                                        <button
                                            onClick={() => generateFeature(groupName)}
                                            disabled={processingId === groupName}
                                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-medium hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg shadow-pink-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
                                        >
                                            {processingId === groupName ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Play size={16} className="fill-current group-hover/btn:translate-x-0.5 transition-transform" />
                                                    <span>Generate</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ExcelSplitter;
