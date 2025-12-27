import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader } from 'lucide-react';
import { chatWithAI } from '../utils/aiService';

const ChatAssistant = ({ contextData, contextType, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I am Compass AI. How can I help you regarding this module?' }
    ]);
    const chatEndRef = useRef(null);

    // Scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const result = await chatWithAI(contextData, userMsg, contextType);

            // Update the chat with AI's response
            if (result.message) {
                setMessages(prev => [...prev, { role: 'ai', text: result.message }]);
            }

            // If there's updated data, trigger the callback
            if (result.updatedData) {
                onUpdate(result.updatedData);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                className={`chat-toggle-btn ${isOpen ? 'hidden' : ''}`}
                onClick={() => setIsOpen(true)}
                title="Compass AI Assistant"
            >
                <Sparkles size={20} />
                Refine with AI
            </button>

            <div className={`chat-panel glass-panel ${isOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <div className="chat-title">
                        <Sparkles size={18} className="ai-icon" />
                        <h3>AI Assistant</h3>
                    </div>
                    <button className="close-chat" onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.role}`}>
                            <div className="message-content">{msg.text}</div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message ai">
                            <div className="message-content typing">
                                <Loader size={14} className="spin" />
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSend} className="chat-input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a command or say hi..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={!input.trim() || loading} className="send-btn">
                        <Send size={16} />
                    </button>
                </form>
            </div>

            <style>{`
        /* Reuse the same styles from ResultsView to maintain consistency */
        /* We can assume the global CSS or specific component CSS handles general variables */
        /* But we need to ensure this component's specific layout is included */
        
        .chat-toggle-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: var(--accent-primary, #8b5cf6);
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
          z-index: 1000;
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
          z-index: 1000;
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
        
        .chat-title h3 {
           margin: 0;
           font-size: 1rem;
           color: var(--text-primary, #fff);
        }

        .ai-icon {
          color: var(--accent-primary, #8b5cf6);
        }

        .close-chat {
          background: none;
          border: none;
          color: var(--text-secondary, #9ca3af);
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
          background: var(--accent-primary, #8b5cf6);
          color: white;
          border-bottom-right-radius: 2px;
        }

        .message.ai .message-content {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary, #fff);
          border-bottom-left-radius: 2px;
        }

        .typing {
          display: flex;
          align-items: center;
          gap: 8px;
          font-style: italic;
          color: var(--text-secondary, #9ca3af);
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
          border-color: var(--accent-primary, #8b5cf6);
          background: rgba(255, 255, 255, 0.1);
        }

        .send-btn {
          background: var(--accent-primary, #8b5cf6);
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
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
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
        </>
    );
};

export default ChatAssistant;
