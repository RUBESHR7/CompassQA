import React from 'react';
import { ArrowRight, Compass, Layers, Zap, Shield } from 'lucide-react';
const LandingPage = ({ onStart }) => {
  return (
    <div className="landing-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="text-gradient">Compass QA</span>
            <br />
            Is The Future of

            <p className="hero-subtitle">
              Transform user stories into comprehensive test suites with AI-driven precision.
              Experience the next generation of quality assurance.
            </p>

            <button className="btn-start" onClick={onStart}>
              Get Started
              <ArrowRight size={20} />
            </button>
        </div >

        <div className="hero-visuals">
          <div className="visual-card card-1">
            <div className="card-icon"><Zap size={24} /></div>
            <div className="card-text">
              <h3>AI Powered</h3>
              <p>Instant generation</p>
            </div>
          </div>
          <div className="visual-card card-2">
            <div className="card-icon"><Layers size={24} /></div>
            <div className="card-text">
              <h3>Structured</h3>
              <p>Excel ready export</p>
            </div>
          </div>
          <div className="visual-card card-3">
            <div className="card-icon"><Shield size={24} /></div>
            <div className="card-text">
              <h3>Secure</h3>
              <p>Enterprise grade</p>
            </div>
          </div>

          <div className="glow-effect"></div>
        </div>
      </div >

      <style>{`
        .landing-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-2xl);
          position: relative;
          overflow: hidden;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-3xl);
          max-width: 1400px;
          width: 100%;
          align-items: center;
          z-index: 1;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-lg);
        }

        .badge-pill {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background-color: var(--accent-primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--accent-primary);
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: 5rem;
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 500px;
          line-height: 1.6;
        }

        .btn-start {
          margin-top: var(--spacing-lg);
          background: var(--text-primary);
          color: var(--bg-primary);
          padding: 1rem 2.5rem;
          border-radius: var(--radius-full);
          font-size: 1.125rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: all var(--transition-bounce);
        }

        .btn-start:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }

        .hero-visuals {
          position: relative;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visual-card {
          position: absolute;
          background: rgba(20, 20, 20, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: var(--spacing-lg);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          width: 280px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transition: transform var(--transition-normal);
        }

        .visual-card:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .card-1 {
          top: 10%;
          right: 10%;
          z-index: 3;
        }

        .card-2 {
          top: 40%;
          left: 5%;
          z-index: 2;
        }

        .card-3 {
          bottom: 15%;
          right: 20%;
          z-index: 1;
        }

        .card-icon {
          background: rgba(139, 92, 246, 0.1);
          padding: 12px;
          border-radius: var(--radius-md);
          color: var(--accent-primary);
        }

        .card-text h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .card-text p {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .glow-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
          filter: blur(60px);
          z-index: 0;
        }

        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-content {
            align-items: center;
          }

          .hero-title {
            font-size: 3.5rem;
          }

          .hero-visuals {
            height: 400px;
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .landing-container {
            padding: var(--spacing-lg);
            align-items: flex-start;
            padding-top: 100px; 
          }

          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1rem;
          }

          .hero-visuals {
            height: 300px;
            margin-top: var(--spacing-xl);
          }

          .visual-card {
            width: 240px;
            padding: var(--spacing-md);
          }

          .card-1 { top: 0; right: 5%; }
          .card-2 { top: 35%; left: 0; }
          .card-3 { bottom: 0; right: 10%; }
        }
      `}</style>
    </div >
  );
};

export default LandingPage;
