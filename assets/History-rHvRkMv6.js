import{c as t,j as a}from"./index-C0tsSZS9.js";import{F as o}from"./file-text-D1MnSZ0m.js";import{A as d}from"./arrow-right-DdPo1S0p.js";const c=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],l=t("calendar",c);const p=[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],m=t("clock",p);const g=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],x=t("trash-2",g),f=({history:r,onLoad:s,onDelete:i})=>!r||r.length===0?a.jsxs("div",{className:"history-empty",children:[a.jsx("div",{className:"empty-icon",children:a.jsx(m,{size:48})}),a.jsx("h2",{children:"No History Yet"}),a.jsx("p",{children:"Generate some test cases to see them here."})]}):a.jsxs("div",{className:"history-container",children:[a.jsxs("div",{className:"history-header",children:[a.jsx("h1",{className:"history-title",children:a.jsx("span",{className:"text-gradient",children:"History"})}),a.jsx("p",{className:"history-subtitle",children:"View and restore your previous test case generations."})]}),a.jsx("div",{className:"history-grid",children:r.map(e=>a.jsxs("div",{className:"history-card",children:[a.jsxs("div",{className:"card-header",children:[a.jsxs("div",{className:"card-date",children:[a.jsx(l,{size:16}),a.jsx("span",{children:new Date(e.date).toLocaleDateString()}),a.jsx("span",{className:"date-separator",children:"•"}),a.jsx("span",{children:new Date(e.date).toLocaleTimeString()})]}),a.jsx("button",{className:"btn-delete",onClick:n=>{n.stopPropagation(),i(e.id)},title:"Delete",children:a.jsx(x,{size:18})})]}),a.jsxs("div",{className:"card-content",children:[a.jsxs("div",{className:"story-preview",children:[a.jsx(o,{size:20,className:"story-icon"}),a.jsx("p",{children:e.userStory.length>100?e.userStory.substring(0,100)+"...":e.userStory})]}),a.jsxs("div",{className:"card-stats",children:[a.jsxs("div",{className:"stat-badge",children:[e.testCases.length," Test Cases"]}),e.filename&&a.jsx("div",{className:"stat-badge filename",children:e.filename})]})]}),a.jsx("div",{className:"card-footer",children:a.jsxs("button",{className:"btn-load",onClick:()=>s(e),children:["Load Project",a.jsx(d,{size:16})]})})]},e.id))}),a.jsx("style",{children:`
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
      `})]});export{f as default};
