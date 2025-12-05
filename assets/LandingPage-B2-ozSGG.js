import{c as a,j as e}from"./index-DGa6QIMi.js";import{A as i}from"./arrow-right-Dep-p2Va.js";import{Z as t,L as s}from"./zap-DxtZ7KR3.js";const n=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]],d=a("shield",n),p=({onStart:r})=>e.jsxs("div",{className:"landing-container",children:[e.jsxs("div",{className:"hero-section",children:[e.jsxs("div",{className:"hero-content",children:[e.jsxs("h1",{className:"hero-title",children:[e.jsx("span",{className:"text-gradient",children:"Compass QA"}),e.jsx("br",{}),"Is The Future of",e.jsx("br",{}),"Test Automation"]}),e.jsx("p",{className:"hero-subtitle",children:"Transform user stories into comprehensive test suites with AI-driven precision. Experience the next generation of quality assurance."}),e.jsxs("button",{className:"btn-start",onClick:r,children:["Get Started",e.jsx(i,{size:20})]})]}),e.jsxs("div",{className:"hero-visuals",children:[e.jsxs("div",{className:"visual-card card-1",children:[e.jsx("div",{className:"card-icon",children:e.jsx(t,{size:24})}),e.jsxs("div",{className:"card-text",children:[e.jsx("h3",{children:"AI Powered"}),e.jsx("p",{children:"Instant generation"})]})]}),e.jsxs("div",{className:"visual-card card-2",children:[e.jsx("div",{className:"card-icon",children:e.jsx(s,{size:24})}),e.jsxs("div",{className:"card-text",children:[e.jsx("h3",{children:"Structured"}),e.jsx("p",{children:"Excel ready export"})]})]}),e.jsxs("div",{className:"visual-card card-3",children:[e.jsx("div",{className:"card-icon",children:e.jsx(d,{size:24})}),e.jsxs("div",{className:"card-text",children:[e.jsx("h3",{children:"Secure"}),e.jsx("p",{children:"Enterprise grade"})]})]}),e.jsx("div",{className:"glow-effect"})]})]}),e.jsx("style",{children:`
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
      `})]});export{p as default};
