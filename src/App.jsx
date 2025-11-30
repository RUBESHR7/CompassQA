import React, { useState } from 'react';
import Layout from './components/Layout';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import LandingPage from './components/LandingPage';
import Documentation from './components/Documentation';
import { generateTestCases } from './utils/aiService';
import { exportToExcel } from './utils/excelGenerator';

import BackgroundWaves from './components/BackgroundWaves';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'app', 'docs'
  const [testCases, setTestCases] = useState(null);
  const [filename, setFilename] = useState("TestCases.xlsx");
  const [loading, setLoading] = useState(false);

  // WARNING: Hardcoding API keys in client-side code is insecure.
  // The key will be visible to anyone who inspects the code.
  const API_KEY = "AIzaSyBq4RiJNeQvK5VAUJUEq8tkCcK9rBOCk5g";

  const handleGenerate = async (data) => {
    setLoading(true);
    try {
      const result = await generateTestCases(data.userStory, data.screenshots, data.numTestCases, API_KEY);
      setTestCases(result.testCases);
      setFilename(result.suggestedFilename);
    } catch (error) {
      console.error("Error generating test cases:", error);
      alert(`Failed to generate test cases: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (testCases) {
      exportToExcel(testCases, filename);
    }
  };

  const handleReset = () => {
    setTestCases(null);
  };

  const handleHomeClick = () => {
    setCurrentView('landing');
    setTestCases(null);
  };

  const handleDocsClick = () => {
    setCurrentView('docs');
  };

  const handleStart = () => {
    setCurrentView('app');
  };

  const renderContent = () => {
    if (currentView === 'docs') {
      return <Documentation />;
    }

    if (!testCases) {
      return (
        <>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '1rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em'
            }}>
              <span className="text-gradient">New Project</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
              Configure your test generation settings below.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Analyzing requirements...</p>
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
          ) : (
            <InputForm onGenerate={handleGenerate} />
          )}
        </>
      );
    }

    return (
      <ResultsView
        testCases={testCases}
        filename={filename}
        apiKey={API_KEY}
        onExport={handleExport}
        onReset={handleReset}
        onUpdate={(newCases, newName) => {
          setTestCases(newCases);
          if (newName) setFilename(newName);
        }}
      />
    );
  };

  return (
    <>
      <BackgroundWaves />
      {currentView === 'landing' ? (
        <LandingPage onStart={handleStart} />
      ) : (
        <Layout onLogoClick={handleHomeClick} onDocsClick={handleDocsClick}>
          {renderContent()}
        </Layout>
      )}
    </>
  );
}

export default App;
