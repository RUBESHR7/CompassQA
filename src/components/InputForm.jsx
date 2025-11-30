import React, { useState, useRef } from 'react';
import { Upload, FileText, Settings, X, ChevronDown } from 'lucide-react';

const InputForm = ({ onGenerate }) => {
  const [userStory, setUserStory] = useState('');
  const [testCaseId, setTestCaseId] = useState('TC_001');
  const [screenshots, setScreenshots] = useState([]);
  const [numTestCases, setNumTestCases] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      const imageFiles = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          imageFiles.push(blob);
        }
      }

      if (imageFiles.length > 0) {
        setScreenshots(prev => [...prev, ...imageFiles]);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setScreenshots(prev => [...prev, ...imageFiles]);
  };

  const removeScreenshot = (index) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({ userStory, testCaseId, screenshots, numTestCases });
  };

  return (
    <div className="input-form-container">
      <form onSubmit={handleSubmit} className="bento-grid">
        {/* User Story Card */}
        <div className="bento-card story-card glass-panel">
          <div className="card-header">
            <div className="icon-wrapper"><FileText size={20} /></div>
            <h3>User Story</h3>
          </div>
          <textarea
            value={userStory}
            onChange={(e) => setUserStory(e.target.value)}
            placeholder="As a user, I want to..."
            required
          />
        </div>

        {/* Configuration Column */}
        <div className="config-column">
          {/* ID Card */}
          <div className="bento-card id-card glass-panel">
            <div className="card-header">
              <div className="icon-wrapper"><Settings size={20} /></div>
              <h3>Test Case ID</h3>
            </div>
            <input
              type="text"
              value={testCaseId}
              onChange={(e) => setTestCaseId(e.target.value)}
              placeholder="TC_001"
              required
            />
          </div>

          {/* Count Card */}
          <div className="bento-card count-card glass-panel">
            <div className="card-header">
              <div className="icon-wrapper"><ChevronDown size={20} /></div>
              <h3>Count</h3>
            </div>
            <select
              value={numTestCases}
              onChange={(e) => setNumTestCases(Number(e.target.value))}
            >
              <option value={3}>3 Cases</option>
              <option value={5}>5 Cases</option>
              <option value={7}>7 Cases</option>
              <option value={10}>10 Cases</option>
              <option value={15}>15 Cases</option>
              <option value={20}>20 Cases</option>
            </select>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bento-card upload-card glass-panel">
          <div className="card-header">
            <div className="icon-wrapper"><Upload size={20} /></div>
            <h3>Screenshots</h3>
          </div>

          <div
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*"
              hidden
            />
            <div className="dropzone-content">
              <p>Drop images here or <strong>Click</strong></p>
              <p className="sub-text">Paste (Ctrl+V) supported</p>
            </div>
          </div>

          {screenshots.length > 0 && (
            <div className="file-list">
              {screenshots.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeScreenshot(index);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-generate">
          Generate Test Cases
        </button>
      </form>

      <style>{`
        .input-form-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: auto auto auto;
          gap: var(--spacing-lg);
        }

        .bento-card {
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          transition: transform var(--transition-fast);
        }

        .bento-card:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .card-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .icon-wrapper {
          background: rgba(255, 255, 255, 0.05);
          padding: 8px;
          border-radius: var(--radius-md);
          color: var(--accent-primary);
        }

        /* Specific Card Styles */
        .story-card {
          grid-column: 1;
          grid-row: 1 / span 2;
        }

        .config-column {
          grid-column: 2;
          grid-row: 1 / span 2;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .upload-card {
          grid-column: 1 / span 2;
        }

        /* Inputs */
        textarea, input[type="text"], select {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          color: var(--text-primary);
          font-size: 0.925rem;
          transition: all var(--transition-fast);
        }

        textarea {
          flex: 1;
          resize: none;
          min-height: 200px;
        }

        textarea:focus, input:focus, select:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
          background: rgba(0, 0, 0, 0.4);
        }

        /* Dropzone */
        .dropzone {
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          background: rgba(0, 0, 0, 0.2);
        }

        .dropzone:hover, .dropzone.dragging {
          border-color: var(--accent-primary);
          background: rgba(139, 92, 246, 0.05);
        }

        .sub-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .file-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .file-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .remove-btn {
          color: var(--text-muted);
          padding: 2px;
          display: flex;
        }

        .remove-btn:hover {
          color: #ef4444;
        }

        /* Generate Button */
        .btn-generate {
          grid-column: 1 / span 2;
          background: var(--text-primary);
          color: var(--bg-primary);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          font-weight: 600;
          font-size: 1.125rem;
          transition: all var(--transition-bounce);
          box-shadow: var(--shadow-glow);
        }

        .btn-generate:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .input-form-container {
            padding: 0 var(--spacing-md);
          }

          .bento-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            gap: var(--spacing-md);
          }
          
          .story-card, .config-column, .upload-card, .btn-generate {
            grid-column: 1;
            grid-row: auto;
          }

          .bento-card {
            padding: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
};

export default InputForm;
