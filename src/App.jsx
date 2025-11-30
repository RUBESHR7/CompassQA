import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import Layout from './components/Layout';
import BackgroundWaves from './components/BackgroundWaves';
import { generateTestCases } from './utils/aiService';
import { exportToExcel } from './utils/excelGenerator';

// Lazy load components
const InputForm = lazy(() => import('./components/InputForm'));
const ResultsView = lazy(() => import('./components/ResultsView'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const Documentation = lazy(() => import('./components/Documentation'));
const History = lazy(() => import('./components/History'));

function App() {
  const [testCases, setTestCases] = useState(null);
  const [filename, setFilename] = useState("TestCases.xlsx");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Load from localStorage on mount
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

    const savedHistory = localStorage.getItem('compass_qa_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (testCases) {
      localStorage.setItem('compass_qa_test_cases', JSON.stringify({ testCases, filename }));
    }
  }, [testCases, filename]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('compass_qa_history', JSON.stringify(history));
  }, [history]);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handleGenerate = async (data) => {
    if (!API_KEY) {
      toast.error("API Key is missing. Please check your .env file.");
      return;
    }

    setLoading(true);
    try {
      const result = await generateTestCases(data.userStory, data.screenshots, data.numTestCases, API_KEY);
      setTestCases(result.testCases);
      setFilename(result.suggestedFilename);

      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        userStory: data.userStory,
        testCases: result.testCases,
        filename: result.suggestedFilename
      };

      setHistory(prev => [newHistoryItem, ...prev]);

      toast.success("Test cases generated successfully!");
    } catch (error) {
      console.error("Error generating test cases:", error);
      toast.error(`Failed to generate test cases: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (testCases) {
      exportToExcel(testCases, filename);
      toast.success("Export started!");
    }
  };

  const handleReset = () => {
    setTestCases(null);
    localStorage.removeItem('compass_qa_test_cases');
    toast.info("Project reset.");
  };

  const handleLoadHistory = (item) => {
    setTestCases(item.testCases);
    setFilename(item.filename);
    navigate('/app');
    toast.success("Project loaded from history");
  };

  const handleDeleteHistory = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast.success("History item deleted");
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleDocsClick = () => {
    navigate('/docs');
  };

  const handleHistoryClick = () => {
    navigate('/history');
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
    <>
      <Toaster position="top-center" theme="dark" />
      <BackgroundWaves />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage onStart={() => navigate('/app')} />} />
          <Route path="/docs" element={
            <Layout onLogoClick={handleHomeClick} onDocsClick={handleDocsClick} onHistoryClick={handleHistoryClick}>
              <Documentation />
            </Layout>
          } />
          <Route path="/history" element={
            <Layout onLogoClick={handleHomeClick} onDocsClick={handleDocsClick} onHistoryClick={handleHistoryClick}>
              <History
                history={history}
                onLoad={handleLoadHistory}
                onDelete={handleDeleteHistory}
              />
            </Layout>
          } />
          <Route path="/app" element={
            <Layout onLogoClick={handleHomeClick} onDocsClick={handleDocsClick} onHistoryClick={handleHistoryClick}>
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
                      <span className="text-gradient">New Project</span>
                    </h1>
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
                  apiKey={API_KEY}
                  onExport={handleExport}
                  onReset={handleReset}
                  onUpdate={(newCases, newName) => {
                    setTestCases(newCases);
                    if (newName) setFilename(newName);
                  }}
                />
              )}
            </Layout>
          } />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
