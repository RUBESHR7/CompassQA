import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Github, Twitter } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header className="header glass-panel">
        <div className="header-content">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon">
              <Compass size={24} />
            </div>
            <span className="logo-text">Compass QA</span>
          </Link>

          <nav className="nav-links">
            <Link to="/docs" className="nav-link">Documentation</Link>
            <a href="#" className="nav-link">Pricing</a>
            <a href="#" className="nav-link">Enterprise</a>
          </nav>

          <div className="social-links">
            <a href="#" className="social-link"><Github size={20} /></a>
            <a href="#" className="social-link"><Twitter size={20} /></a>
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Compass QA. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

      <style>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header {
          position: fixed;
          top: var(--spacing-md);
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - var(--spacing-xl));
          max-width: 1200px;
          border-radius: var(--radius-full);
          z-index: 100;
          padding: 0.75rem 1.5rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--text-primary);
        }

        .logo-icon {
          background: var(--accent-gradient);
          padding: 6px;
          border-radius: var(--radius-full);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.125rem;
          letter-spacing: -0.01em;
        }

        .nav-links {
          display: flex;
          gap: var(--spacing-xl);
        }

        .nav-link {
          font-size: 0.925rem;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
          font-weight: 500;
          text-decoration: none;
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .social-links {
          display: flex;
          gap: var(--spacing-md);
        }

        .social-link {
          color: var(--text-secondary);
          transition: color var(--transition-fast);
        }

        .social-link:hover {
          color: var(--text-primary);
        }

        .main-content {
          flex: 1;
          padding: var(--spacing-3xl) var(--spacing-md) var(--spacing-xl);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          margin-top: 4rem;
        }

        .footer {
          border-top: 1px solid var(--border-color);
          padding: var(--spacing-xl) 0;
          margin-top: auto;
          background: rgba(5, 5, 5, 0.8);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .footer-links {
          display: flex;
          gap: var(--spacing-lg);
        }

        .footer-links a:hover {
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          
          .header {
            width: calc(100% - var(--spacing-md));
            top: var(--spacing-sm);
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
