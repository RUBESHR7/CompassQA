import React, { useState, useEffect } from 'react';
import { Download, CheckCircle } from 'lucide-react';
import ChatAssistant from './ChatAssistant';

const ResultsView = ({ testCases, filename, onExport, onReset, onUpdate }) => {
  console.log("ResultsView Received Data:", testCases);

  // Scroll to top only once when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!testCases || testCases.length === 0) {
    return (
      <div className="results-container">
        <div className="results-header">
          <h2>No Test Cases Generated</h2>
          <button className="btn-secondary" onClick={onReset}>Go Back</button>
        </div>
      </div>
    );
  }

  const handleChatUpdate = (updatedData) => {
    // updatedData from ChatAssistant for 'test-cases' context 
    // is expected to be { testCases: [...], suggestedFilename: "..." }
    if (updatedData && updatedData.testCases) {
      onUpdate(updatedData.testCases, updatedData.suggestedFilename);
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <div className="header-left">
          <CheckCircle className="success-icon" size={24} />
          <div>
            <h2>Generated Test Cases</h2>
            <p className="filename-badge">{filename}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={onReset}>
            Start Over
          </button>
          <button className="btn-primary" onClick={onExport}>
            <Download size={18} />
            Export to Excel
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Summary</th>
                <th>Pre-conditions</th>
                <th>Steps</th>
                <th>Expected Result</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc, index) => (
                <React.Fragment key={index}>
                  <tr className="tc-row">
                    <td className="tc-id">{tc.id}</td>
                    <td>{tc.summary}</td>
                    <td>{tc.preConditions}</td>
                    <td>
                      <ol className="steps-list">
                        {tc.steps && tc.steps.length > 0 ? tc.steps.map((step, i) => (
                          <li key={i}>
                            <strong>{step.description}</strong>
                            {step.inputData && <><br /><span className="step-detail">Input: {step.inputData}</span></>}
                            <br />
                            <span className="step-detail">Expected: {step.expectedOutcome}</span>
                          </li>
                        )) : <li>No steps defined</li>}
                      </ol>
                    </td>
                    <td>{tc.steps && tc.steps.length > 0 ? tc.steps[tc.steps.length - 1].expectedOutcome : '-'}</td>
                    <td>
                      <span className={`badge badge-${(tc.priority || 'Medium').toLowerCase()}`}>
                        {tc.priority || 'Medium'}
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scroll to Top Button (Left Side) */}
      <button
        className="scroll-top-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to Top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {/* AI Chat Assistant */}
      <ChatAssistant
        contextData={{ testCases, suggestedFilename: filename }}
        contextType="test-cases"
        onUpdate={handleChatUpdate}
      />

      <style>{`
        .results-container {
          margin-top: var(--spacing-2xl);
          animation: fadeIn 0.5s ease-out;
          position: relative;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .success-icon {
          color: #10b981;
        }

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .filename-badge {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
          margin-top: 4px;
          display: inline-block;
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-md);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: var(--accent-gradient);
          color: white;
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: opacity var(--transition-fast);
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .btn-secondary:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }

        .table-container {
          background-color: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          overflow-x: auto;
          box-shadow: var(--shadow-lg);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        th {
          text-align: left;
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--border-color);
        }

        td {
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.925rem;
          vertical-align: top;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .tc-id {
          font-family: monospace;
          color: var(--accent-primary);
          font-weight: 600;
        }

        .steps-list {
          padding-left: var(--spacing-lg);
          margin: 0;
        }

        .steps-list li {
          margin-bottom: 8px;
        }
        
        .step-detail {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .badge {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-high {
          background-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .badge-medium {
          background-color: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        
        .badge-low {
          background-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .scroll-top-btn {
          position: fixed;
          bottom: 30px;
          left: 30px;
          background: rgba(20, 20, 25, 0.8);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .scroll-top-btn:hover {
          background: var(--accent-primary);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  );
};

export default ResultsView;

