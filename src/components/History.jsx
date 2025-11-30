import React from 'react';
import { Clock, FileText, Trash2, ArrowRight, Calendar } from 'lucide-react';

const History = ({ history, onLoad, onDelete }) => {
    if (!history || history.length === 0) {
        return (
            <div className="history-empty">
                <div className="empty-icon">
                    <Clock size={48} />
                </div>
                <h2>No History Yet</h2>
                <p>Generate some test cases to see them here.</p>
            </div>
        );
    }

    return (
        <div className="history-container">
            <div className="history-header">
                <h1 className="history-title">
                    <span className="text-gradient">History</span>
                </h1>
                <p className="history-subtitle">
                    View and restore your previous test case generations.
                </p>
            </div>

            <div className="history-grid">
                {history.map((item) => (
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
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
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
                            <button className="btn-load" onClick={() => onLoad(item)}>
                                Load Project
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .history-container {
          padding: var(--spacing-xl);
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .history-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-icon {
          background: rgba(255, 255, 255, 0.05);
          padding: 2rem;
          border-radius: 50%;
          margin-bottom: var(--spacing-lg);
          color: var(--text-muted);
        }

        .history-header {
          text-align: center;
          margin-bottom: var(--spacing-3xl);
        }

        .history-title {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          letter-spacing: -0.02em;
        }

        .history-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--spacing-xl);
        }

        .history-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          transition: all var(--transition-normal);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .history-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .date-separator {
          color: var(--text-muted);
          opacity: 0.5;
        }

        .btn-delete {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .btn-delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .story-preview {
          display: flex;
          gap: var(--spacing-md);
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .story-icon {
          flex-shrink: 0;
          color: var(--accent-primary);
          margin-top: 2px;
        }

        .card-stats {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .stat-badge {
          background: rgba(139, 92, 246, 0.1);
          color: var(--accent-primary);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .stat-badge.filename {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
        }

        .card-footer {
          margin-top: auto;
          padding-top: var(--spacing-md);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .btn-load {
          width: 100%;
          background: var(--text-primary);
          color: var(--bg-primary);
          border: none;
          padding: 10px;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          transition: all var(--transition-fast);
        }

        .btn-load:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default History;
