import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Code, Database, Terminal, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();

  const tools = [
    {
      title: 'Test Case Design',
      description: 'Generate comprehensive test cases from User Stories using AI.',
      icon: FileText,
      path: '/app',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      title: 'Excel to Feature',
      description: 'Split Excel by User Story and generate Feature files.',
      icon: FileSpreadsheet,
      path: '/excel-splitter',
      color: 'from-pink-500 to-rose-500',
      delay: 0.2
    },
    {
      title: 'Create Step Definitions',
      description: 'Generate Python/Selenium step definitions from Feature files.',
      icon: Terminal,
      path: '/step-def-generator',
      color: 'from-green-500 to-emerald-500',
      delay: 0.3
    },
    {
      title: 'Analyze Feature File',
      description: 'Parse Feature files into structured JSON for analysis.',
      icon: Database,
      path: '/json-analyzer',
      color: 'from-orange-500 to-red-500',
      delay: 0.4
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Automation Suite</h1>
        <p>Select a tool to get started</p>
      </div>

      <div className="tools-grid">
        {tools.map((tool, index) => (
          <motion.div
            key={index}
            className="tool-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: tool.delay }}
            onClick={() => navigate(tool.path)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`icon-wrapper bg-gradient-to-br ${tool.color}`}>
              <tool.icon size={32} color="white" />
            </div>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
          </motion.div>
        ))}
      </div>

      <style>{`
        .dashboard-container {
          padding: 0 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .dashboard-header h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: white;
        }

        .dashboard-header p {
          color: var(--text-secondary);
          font-size: 1.25rem;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .tools-grid {
            grid-template-columns: 1fr;
          }
        }

        .tool-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .tool-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .tool-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .tool-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
