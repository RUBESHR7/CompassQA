import{c as i,r as t,j as e,R as w,a as N}from"./index-DvrbWvBI.js";import{X as z}from"./x-Duy_dZym.js";const I=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],C=i("circle-check-big",I);const M=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],R=i("download",M);const S=[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]],_=i("loader",S);const E=[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]],$=i("send",E);const A=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],u=i("sparkles",A),Y=({testCases:o,filename:f,onExport:y,onReset:v,onUpdate:j})=>{const[l,h]=t.useState(!1),[c,x]=t.useState(""),[d,g]=t.useState(!1),[m,p]=t.useState([{role:"ai",text:"Hi! I am Compass AI. I can help you refine these test cases or just chat. How can I help you?"}]),b=t.useRef(null);if(t.useEffect(()=>{window.scrollTo(0,0)},[]),t.useEffect(()=>{b.current?.scrollIntoView({behavior:"smooth"})},[m,l]),!o||o.length===0)return null;const k=async a=>{if(a.preventDefault(),!c.trim()||d)return;const s=c;x(""),p(r=>[...r,{role:"user",text:s}]),g(!0);try{const r=await N(o,s);r.testCases&&j(r.testCases,r.suggestedFilename),p(n=>[...n,{role:"ai",text:r.message||"I've processed your request."}])}catch(r){console.error("Refinement error:",r),p(n=>[...n,{role:"ai",text:`Sorry, I encountered an error: ${r.message}`}])}finally{g(!1)}};return e.jsxs("div",{className:"results-container",children:[e.jsxs("div",{className:"results-header",children:[e.jsxs("div",{className:"header-left",children:[e.jsx(C,{className:"success-icon",size:24}),e.jsxs("div",{children:[e.jsx("h2",{children:"Generated Test Cases"}),e.jsx("p",{className:"filename-badge",children:f})]})]}),e.jsxs("div",{className:"header-actions",children:[e.jsx("button",{className:"btn-secondary",onClick:v,children:"Start Over"}),e.jsxs("button",{className:"btn-primary",onClick:y,children:[e.jsx(R,{size:18}),"Export to Excel"]})]})]}),e.jsx("div",{className:"content-wrapper",children:e.jsx("div",{className:"table-container",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"ID"}),e.jsx("th",{children:"Summary"}),e.jsx("th",{children:"Pre-conditions"}),e.jsx("th",{children:"Steps"}),e.jsx("th",{children:"Expected Result"}),e.jsx("th",{children:"Priority"})]})}),e.jsx("tbody",{children:o.map((a,s)=>e.jsx(w.Fragment,{children:e.jsxs("tr",{className:"tc-row",children:[e.jsx("td",{className:"tc-id",children:a.id}),e.jsx("td",{children:a.summary}),e.jsx("td",{children:a.preConditions}),e.jsx("td",{children:e.jsx("ol",{className:"steps-list",children:a.steps.map((r,n)=>e.jsxs("li",{children:[e.jsx("strong",{children:r.description}),r.inputData&&e.jsxs(e.Fragment,{children:[e.jsx("br",{}),e.jsxs("span",{className:"step-detail",children:["Input: ",r.inputData]})]}),e.jsx("br",{}),e.jsxs("span",{className:"step-detail",children:["Expected: ",r.expectedOutcome]})]},n))})}),e.jsx("td",{children:a.steps[a.steps.length-1].expectedOutcome}),e.jsx("td",{children:e.jsx("span",{className:`badge badge-${a.priority.toLowerCase()}`,children:a.priority})})]})},s))})]})})}),e.jsxs("button",{className:`chat-toggle-btn ${l?"hidden":""}`,onClick:()=>h(!0),children:[e.jsx(u,{size:20}),"Refine with AI"]}),e.jsxs("div",{className:`chat-panel glass-panel ${l?"open":""}`,children:[e.jsxs("div",{className:"chat-header",children:[e.jsxs("div",{className:"chat-title",children:[e.jsx(u,{size:18,className:"ai-icon"}),e.jsx("h3",{children:"AI Assistant"})]}),e.jsx("button",{className:"close-chat",onClick:()=>h(!1),children:e.jsx(z,{size:18})})]}),e.jsxs("div",{className:"chat-messages",children:[m.map((a,s)=>e.jsx("div",{className:`message ${a.role}`,children:e.jsx("div",{className:"message-content",children:a.text})},s)),d&&e.jsx("div",{className:"message ai",children:e.jsxs("div",{className:"message-content typing",children:[e.jsx(_,{size:14,className:"spin"}),"Refining test cases..."]})}),e.jsx("div",{ref:b})]}),e.jsxs("form",{onSubmit:k,className:"chat-input-area",children:[e.jsx("input",{type:"text",value:c,onChange:a=>x(a.target.value),placeholder:"Type a command...",disabled:d}),e.jsx("button",{type:"submit",disabled:!c.trim()||d,className:"send-btn",children:e.jsx($,{size:16})})]})]}),e.jsx("style",{children:`
        .results-container {
          margin-top: var(--spacing-2xl);
          animation: fadeIn 0.5s ease-out;
          position: relative;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .success-icon {
          color: #10b981;
        }

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .filename-badge {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
          margin-top: 4px;
          display: inline-block;
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-md);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: var(--accent-gradient);
          color: white;
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: opacity var(--transition-fast);
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .btn-secondary:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }

        .table-container {
          background-color: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          overflow-x: auto;
          box-shadow: var(--shadow-lg);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        th {
          text-align: left;
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--border-color);
        }

        td {
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.925rem;
          vertical-align: top;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .tc-id {
          font-family: monospace;
          color: var(--accent-primary);
          font-weight: 600;
        }

        .steps-list {
          padding-left: var(--spacing-lg);
          margin: 0;
        }

        .steps-list li {
          margin-bottom: 8px;
        }
        
        .step-detail {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .badge {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-high {
          background-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .badge-medium {
          background-color: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        
        .badge-low {
          background-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        /* Chat UI */
        .chat-toggle-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: var(--accent-primary);
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
          z-index: 100;
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
          z-index: 100;
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

        .ai-icon {
          color: var(--accent-primary);
        }

        .chat-header h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .close-chat {
          background: none;
          border: none;
          color: var(--text-secondary);
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
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 2px;
        }

        .message.ai .message-content {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          border-bottom-left-radius: 2px;
        }

        .typing {
          display: flex;
          align-items: center;
          gap: 8px;
          font-style: italic;
          color: var(--text-secondary);
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
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.1);
        }

        .send-btn {
          background: var(--accent-primary);
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
          background: #7c3aed;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .results-container {
            padding: 0 var(--spacing-md);
            margin-top: var(--spacing-xl);
          }

          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .btn-primary, .btn-secondary {
            flex: 1;
            justify-content: center;
            padding: var(--spacing-sm);
            font-size: 0.9rem;
          }

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
      `})]})};export{Y as default};
