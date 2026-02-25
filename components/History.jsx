"use client";
import React, { useState } from 'react';
import { Clock, FileText, Trash2, ArrowRight, Calendar, Database, Layout as LayoutIcon, Download, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const History = ({ testHistory, automationHistory, onLoadTest, onLoadAutomation, onDeleteTest, onDeleteAutomation }) => {
  const [activeTab, setActiveTab] = useState('test-design');

  const EmptyState = ({ message }) => (
    <div className="history-empty">
      <div className="empty-icon">
        <Clock size={48} />
      </div>
      <h2>No History Yet</h2>
      <p>{message}</p>
    </div>
  );

  return (
    <div className="history-container">
      <div className="history-header">
        <h1 className="history-title">
          <span className="text-gradient">History</span>
        </h1>
        <p className="history-subtitle">
          Manage your generated test assets and automation script history.
        </p>
      </div>

      <div className="history-tabs">
        <button
          className={`tab-btn ${activeTab === 'test-design' ? 'active' : ''}`}
          onClick={() => setActiveTab('test-design')}
        >
          <LayoutIcon size={18} />
          Test Case Design
        </button>
        <button
          className={`tab-btn ${activeTab === 'automation' ? 'active' : ''}`}
          onClick={() => setActiveTab('automation')}
        >
          <Database size={18} />
          Automation Cycle
        </button>
      </div>

      <div className="history-content">
        <AnimatePresence mode="wait">
          {activeTab === 'test-design' ? (
            <motion.div
              key="test-design"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="history-grid"
            >
              {(!testHistory || testHistory.length === 0) ? (
                <EmptyState message="Generate some test cases to see them here." />
              ) : (
                testHistory.map((item) => (
                  <div key={item.id} className="history-card">
                    <div className="card-header">
                      <div className="card-date">
                        <Calendar size={16} />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span className="date-separator">•</span>
                        <span>{new Date(item.date).toLocaleTimeString()}</span>
                      </div>
                      <button
                        className="btn-delete"
                        onClick={(e) => { e.stopPropagation(); onDeleteTest(item.id); }}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="card-content">
                      <div className="story-preview">
                        <FileText size={20} className="story-icon" />
                        <p>{item.userStory.length > 100 ? item.userStory.substring(0, 100) + '...' : item.userStory}</p>
                      </div>

                      <div className="card-stats">
                        <div className="stat-badge">
                          {item.testCases.length} Test Cases
                        </div>
                        {item.filename && (
                          <div className="stat-badge filename">
                            {item.filename}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-footer">
                      <button className="btn-load" onClick={() => onLoadTest(item)}>
                        Load Project
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="automation"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="history-grid"
            >
              {(!automationHistory || automationHistory.length === 0) ? (
                <EmptyState message="Generate some feature files to see them here." />
              ) : (
                automationHistory.map((item) => (
                  <div key={item.id} className="history-card automation-item">
                    <div className="card-header">
                      <div className="card-date">
                        <Calendar size={16} />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span className="date-separator">•</span>
                        <span>{new Date(item.date).toLocaleTimeString()}</span>
                      </div>
                      <button
                        className="btn-delete"
                        onClick={(e) => { e.stopPropagation(); onDeleteAutomation(item.id); }}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="card-content">
                      <div className="story-preview">
                        <Database size={20} className="story-icon text-pink-500" />
                        <div>
                          <p className="font-bold text-white">{item.fileName}</p>
                          <p className="text-xs mt-1 text-muted">Feature Generated</p>
                        </div>
                      </div>

                      <div className="card-stats">
                        <div className={`stat-badge ${item.stepDefs ? 'bg-green' : 'bg-gray'}`}>
                          {item.stepDefs ? "Step Defs Ready" : "No Step Defs"}
                        </div>
                        <div className="stat-badge feature-badge">
                          Gherkin
                        </div>
                      </div>
                    </div>

                    <div className="card-footer flex-gap">
                      <button className="btn-load" onClick={() => onLoadAutomation(item)}>
                        Explore
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .history-container { padding: var(--spacing-xl); max-width: 1200px; margin: 0 auto; animation: fadeIn 0.5s ease-out; }
        .history-header { text-align: center; margin-bottom: 2rem; }
        .history-title { font-family: var(--font-display); font-size: 3rem; font-weight: 700; margin-bottom: var(--spacing-md); letter-spacing: -0.02em; }
        .history-subtitle { font-size: 1.125rem; color: var(--text-secondary); }

        .history-tabs { display: flex; justify-content: center; gap: 1rem; margin-bottom: 3rem; background: rgba(255, 255, 255, 0.03); padding: 6px; border-radius: 12px; width: fit-content; margin-left: auto; margin-right: auto; border: 1px solid rgba(255, 255, 255, 0.05); }
        .tab-btn { display: flex; align-items: center; gap: 10px; background: transparent; border: none; color: var(--text-muted); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 0.95rem; }
        .tab-btn:hover { color: white; background: rgba(255, 255, 255, 0.05); }
        .tab-btn.active { background: white; color: black; }

        .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--spacing-xl); min-height: 400px; }
        .history-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: var(--radius-xl); padding: var(--spacing-lg); transition: all var(--transition-normal); display: flex; flex-direction: column; gap: var(--spacing-md); }
        .history-card:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1); transform: translateY(-4px); }
        
        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .card-date { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-muted); }
        .date-separator { color: var(--text-muted); opacity: 0.5; }
        .btn-delete { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: var(--radius-md); transition: all var(--transition-fast); }
        .btn-delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .card-content { flex: 1; display: flex; flex-direction: column; gap: var(--spacing-md); }
        .story-preview { display: flex; gap: var(--spacing-md); color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; }
        .story-icon { flex-shrink: 0; color: var(--accent-primary); margin-top: 2px; }
        .card-stats { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }
        .stat-badge { padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 500; }
        .stat-badge.bg-green { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
        .stat-badge.bg-gray { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); }
        .stat-badge.filename, .stat-badge.feature-badge { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); }
        
        .card-footer { margin-top: auto; padding-top: var(--spacing-md); border-top: 1px solid rgba(255, 255, 255, 0.05); }
        .flex-gap { display: flex; gap: 10px; }
        .btn-load { width: 100%; background: var(--text-primary); color: var(--bg-primary); border: none; padding: 10px; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: var(--spacing-sm); transition: all var(--transition-fast); }
        .btn-load:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2); }

        .history-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; grid-column: 1 / -1; width: 100%; text-align: center; color: var(--text-secondary); padding: 4rem 0; }
        .empty-icon { background: rgba(255, 255, 255, 0.05); padding: 2rem; border-radius: 50%; margin-bottom: var(--spacing-lg); color: var(--text-muted); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default History;
