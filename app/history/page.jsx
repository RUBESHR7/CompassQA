"use client";
import React, { useState, useEffect } from 'react';
import History from '../../components/History';
import Layout from '../../components/Layout';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';

export default function HistoryPage() {
    const [testHistory, setTestHistory] = useState([]);
    const [automationHistory, setAutomationHistory] = useState([]);
    const router = useRouter();

    useEffect(() => {
        // Load Test Design History
        const savedTestHistory = localStorage.getItem('compass_qa_history');
        if (savedTestHistory) {
            try {
                setTestHistory(JSON.parse(savedTestHistory));
            } catch (e) {
                console.error("Failed to load test history", e);
            }
        }

        // Load Automation Cycle History
        const savedAutoHistory = localStorage.getItem('automation_history');
        if (savedAutoHistory) {
            try {
                setAutomationHistory(JSON.parse(savedAutoHistory));
            } catch (e) {
                console.error("Failed to load automation history", e);
            }
        }
    }, []);

    const handleLoadTest = (item) => {
        localStorage.setItem('compass_qa_test_cases', JSON.stringify({
            testCases: item.testCases,
            filename: item.filename
        }));
        router.push('/app');
        toast.success("Test Design Project loaded");
    };

    const handleLoadAutomation = (item) => {
        // We can pass state through localized storage to the Automation Cycle page
        localStorage.setItem('automation_temp_view', JSON.stringify(item));
        router.push('/automation-cycle');
    };

    const handleDeleteTest = (id) => {
        const newHistory = testHistory.filter(item => item.id !== id);
        setTestHistory(newHistory);
        localStorage.setItem('compass_qa_history', JSON.stringify(newHistory));
        toast.success("Test history item deleted");
    };

    const handleDeleteAutomation = (id) => {
        const newHistory = automationHistory.filter(item => item.id !== id);
        setAutomationHistory(newHistory);
        localStorage.setItem('automation_history', JSON.stringify(newHistory));
        toast.success("Automation history item deleted");
    };

    return (
        <Layout
            onLogoClick={() => router.push('/')}
            onDocsClick={() => router.push('/docs')}
            onHistoryClick={() => router.push('/history')}
        >
            <Toaster position="top-center" theme="dark" richColors />
            <History
                testHistory={testHistory}
                automationHistory={automationHistory}
                onLoadTest={handleLoadTest}
                onLoadAutomation={handleLoadAutomation}
                onDeleteTest={handleDeleteTest}
                onDeleteAutomation={handleDeleteAutomation}
            />
        </Layout>
    );
}
