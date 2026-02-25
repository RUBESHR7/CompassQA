"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import InputForm from '../../components/InputForm';
import ResultsView from '../../components/ResultsView';
import { generateTestCases } from '../../utils/aiService';
import { exportToExcel } from '../../utils/excelGenerator';
import { toast, Toaster } from 'sonner';

export default function AppPage() {
    const [testCases, setTestCases] = useState(null);
    const [filename, setFilename] = useState("TestCases.xlsx");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem('compass_qa_test_cases');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setTestCases(parsed.testCases);
                setFilename(parsed.filename || "TestCases.xlsx");
            } catch (e) {
                console.error("Failed to load saved test cases", e);
            }
        }
    }, []);

    useEffect(() => {
        if (testCases) {
            localStorage.setItem('compass_qa_test_cases', JSON.stringify({ testCases, filename }));
        }
    }, [testCases, filename]);

    const handleGenerate = async (data) => {
        setLoading(true);
        try {
            const result = await generateTestCases(data.userStory, data.testCaseId, data.screenshots);
            setTestCases(result.testCases);
            setFilename(result.suggestedFilename);

            // Save to history
            const savedHistory = localStorage.getItem('compass_qa_history');
            let history = savedHistory ? JSON.parse(savedHistory) : [];
            const newHistoryItem = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                userStory: data.userStory,
                testCases: result.testCases,
                filename: result.suggestedFilename
            };
            history = [newHistoryItem, ...history];
            localStorage.setItem('compass_qa_history', JSON.stringify(history));

            toast.success("Test cases generated successfully!");
        } catch (error) {
            console.error("Error generating test cases:", error);
            toast.error(`Failed to generate test cases: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (testCases) {
            try {
                await exportToExcel(testCases, filename);
                toast.success("Excel file downloaded successfully!");
            } catch (error) {
                toast.error(`Export failed: ${error.message}`);
            }
        }
    };

    const handleReset = () => {
        setTestCases(null);
        localStorage.removeItem('compass_qa_test_cases');
        toast.info("Project reset.");
    };

    const LoadingSpinner = () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Loading...</p>
            <style>{`
        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(139, 92, 246, 0.1);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );

    return (
        <Layout
            onLogoClick={() => router.push('/')}
            onDocsClick={() => router.push('/docs')}
            onHistoryClick={() => router.push('/history')}
        >
            <Toaster position="top-center" theme="dark" richColors />
            {!testCases ? (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '-0.02em'
                        }}>
                            <span className="text-gradient">Test Case Design</span>
                        </h1>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                            <button
                                onClick={() => router.push('/dashboard')}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                            Configure your test generation settings below.
                        </p>
                    </div>

                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <InputForm onGenerate={handleGenerate} />
                    )}
                </>
            ) : (
                <ResultsView
                    testCases={testCases}
                    filename={filename}
                    onExport={handleExport}
                    onReset={handleReset}
                    onUpdate={(newCases, newName) => {
                        setTestCases(newCases);
                        if (newName) setFilename(newName);
                    }}
                />
            )}
        </Layout>
    );
}
