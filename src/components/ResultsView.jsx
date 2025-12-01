import React, { useState, useRef, useEffect } from 'react';
import { Download, CheckCircle, MessageSquare, Send, X, Loader, Sparkles } from 'lucide-react';
import { refineTestCases } from '../utils/aiService';

const ResultsView = ({ testCases, filename, apiKey, onExport, onReset, onUpdate }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'I can help you refine these test cases. Just tell me what to change! (e.g., "Add a negative case for invalid email")' }
  ]);
  const chatEndRef = useRef(null);

  // Scroll to top only once when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  if (!testCases || testCases.length === 0) {
    return null;
  }

  const handleRefine = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isRefining) return;

    const userMessage = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsRefining(true);

    try {
      const result = await refineTestCases(testCases, userMessage, apiKey);
      onUpdate(result.testCases, result.suggestedFilename);
      setMessages(prev => [...prev, { role: 'ai', text: `Done! I've updated the test cases and set the filename to "${result.suggestedFilename || filename}".` }]);
    } catch (error) {
      console.error("Refinement error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: `Sorry, I encountered an error: ${error.message}` }]);
    } finally {
      setIsRefining(false);
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
                        {tc.steps.map((step, i) => (
                          <li key={i}>
                            <strong>{step.description}</strong>
                            {/* Input Data is intentionally hidden/empty as per requirements, merged into description */}
                            {step.inputData && <><br /><span className="step-detail">Input: {step.inputData}</span></>}
                            <br />
                            <span className="step-detail">Expected: {step.expectedOutcome}</span>
                          </li>
                        ))}
                      </ol>
                    </td>
                    <td>{tc.steps[tc.steps.length - 1].expectedOutcome}</td>
                    <td>
                      <span className={`badge badge-${tc.priority.toLowerCase()}`}>
                        {tc.priority}
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chat Floating Button */}
      <button
        className={`chat-toggle-btn ${isChatOpen ? 'hidden' : ''}`}
        onClick={() => setIsChatOpen(true)}
      >
        <Sparkles size={20} />
        Refine with AI
      </button>

      {/* Chat Panel */}
      <div className={`chat-panel glass-panel ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <Sparkles size={18} className="ai-icon" />
            <h3>AI Assistant</h3>
          </div>
          <button className="close-chat" onClick={() => setIsChatOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">{msg.text}</div>
            </div>
          ))}
          {isRefining && (
            <div className="message ai">
              <div className="message-content typing">
                <Loader size={14} className="spin" />
                Refining test cases...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleRefine} className="chat-input-area">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a command..."
            disabled={isRefining}
          />
          <button type="submit" disabled={!chatInput.trim() || isRefining} className="send-btn">
            <Send size={16} />
          </button>
        </form>
      </div>

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

        /* Chat UI */
        .chat-toggle-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 30px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
        }

        .chat-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(139, 92, 246, 0.6);
        }

        .chat-toggle-btn.hidden {
          transform: scale(0);
          opacity: 0;
          pointer-events: none;
        }

        .chat-panel {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 350px;
          height: 500px;
          background: rgba(20, 20, 25, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          transform: translateY(20px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 100;
          overflow: hidden;
        }

        .chat-panel.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .chat-header {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ai-icon {
          color: var(--accent-primary);
        }

        .chat-header h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .close-chat {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-chat:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 85%;
        }

        .message.user {
          align-self: flex-end;
        }

        .message.ai {
          align-self: flex-start;
        }

        .message-content {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .message.user .message-content {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 2px;
        }

        .message.ai .message-content {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          border-bottom-left-radius: 2px;
        }

        .typing {
          display: flex;
          align-items: center;
          gap: 8px;
          font-style: italic;
          color: var(--text-secondary);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .chat-input-area {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 8px;
          background: rgba(0, 0, 0, 0.2);
        }

        .chat-input-area input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 8px 16px;
          color: white;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
        }

        .chat-input-area input:focus {
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.1);
        }

        .send-btn {
          background: var(--accent-primary);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          background: #7c3aed;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .results-container {
            padding: 0 var(--spacing-md);
            margin-top: var(--spacing-xl);
          }

          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .btn-primary, .btn-secondary {
            flex: 1;
            justify-content: center;
            padding: var(--spacing-sm);
            font-size: 0.9rem;
          }

          .chat-panel {
            width: calc(100vw - 40px);
            right: 20px;
            bottom: 80px;
            height: 60vh;
          }

          .chat-toggle-btn {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsView;
