import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Settings, X, ChevronDown, Eye, Maximize2, Brain, Trash2 } from 'lucide-react';

const InputForm = ({ onGenerate, memoryEnabled, onToggleMemory, onClearMemory, conversationCount }) => {
  const [userStory, setUserStory] = useState('');
  const [testCaseId, setTestCaseId] = useState('TC_001');
  const [screenshots, setScreenshots] = useState([]); // Array of { file: File, url: string }
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // URL of image to preview
  const fileInputRef = useRef(null);

  useEffect(() => {
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
        handleFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      screenshots.forEach(s => URL.revokeObjectURL(s.url));
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
    const newScreenshots = imageFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setScreenshots(prev => [...prev, ...newScreenshots]);
  };

  const removeScreenshot = (index) => {
    setScreenshots(prev => {
      const newScreenshots = [...prev];
      URL.revokeObjectURL(newScreenshots[index].url);
      newScreenshots.splice(index, 1);
      return newScreenshots;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Extract just the File objects for the API
    const filesOnly = screenshots.map(s => s.file);
    onGenerate({ userStory, testCaseId, screenshots: filesOnly });
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

          {/* Memory Toggle Card */}
          <div className="bento-card memory-card glass-panel">
            <div className="card-header">
              <div className="icon-wrapper"><Brain size={20} /></div>
              <h3>AI Memory</h3>
            </div>

            <div className="memory-controls">
              <div className="memory-status">
                <div className="status-indicator">
                  <div className={`status-dot ${memoryEnabled ? 'active' : ''}`}></div>
                  <span>{memoryEnabled ? 'Learning' : 'Stateless'}</span>
                </div>
                {memoryEnabled && conversationCount > 0 && (
                  <span className="conversation-count">{conversationCount} interactions</span>
                )}
              </div>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={memoryEnabled}
                  onChange={onToggleMemory}
                />
                <span className="slider"></span>
              </label>
            </div>

            {memoryEnabled && conversationCount > 0 && (
              <button
                type="button"
                className="clear-memory-btn"
                onClick={onClearMemory}
              >
                <Trash2 size={14} />
                Clear Memory
              </button>
            )}

            <p className="memory-description">
              {memoryEnabled
                ? "AI learns from previous user stories in this session"
                : "Each generation is independent"}
            </p>
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
            <div className="thumbnail-grid">
              {screenshots.map((item, index) => (
                <div key={index} className="thumbnail-item" onClick={() => setPreviewImage(item.url)}>
                  <img src={item.url} alt={`Screenshot ${index + 1}`} />
                  <div className="thumbnail-overlay">
                    <Maximize2 size={16} />
                  </div>
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewImage(null)}>
              <X size={24} />
            </button>
            <img src={previewImage} alt="Full Preview" />
          </div>
        </div>
      )}

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

        /* Thumbnail Grid */
        .thumbnail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: var(--spacing-md);
          margin-top: var(--spacing-md);
        }

        .thumbnail-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .thumbnail-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-fast);
        }

        .thumbnail-item:hover img {
          transform: scale(1.05);
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
          color: white;
        }

        .thumbnail-item:hover .thumbnail-overlay {
          opacity: 1;
        }

        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background var(--transition-fast);
        }

        .remove-btn:hover {
          background: #ef4444;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-content img {
          display: block;
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--transition-fast);
          z-index: 10;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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

        /* Memory Card Styles */
        .memory-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-md);
        }

        .memory-status {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .status-dot.active {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }

        .conversation-count {
          font-size: 0.75rem;
          color: var(--text-muted);
          padding-left: 16px;
        }

        .memory-description {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
        }

        /* Toggle Switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: var(--transition-fast);
          border-radius: 24px;
          border: 1px solid var(--border-color);
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: var(--transition-fast);
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        .slider:hover {
          border-color: var(--accent-primary);
        }

        /* Clear Memory Button */
        .clear-memory-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #ef4444;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .clear-memory-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
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
