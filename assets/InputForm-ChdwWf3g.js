import{c as p,r as n,j as e}from"./index-CYSBr48d.js";import{F as I}from"./file-text-DBrck6XE.js";import{X as v}from"./x-3ZfWUX4-.js";const L=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"m21 3-7 7",key:"1l2asr"}],["path",{d:"m3 21 7-7",key:"tjx5ai"}],["path",{d:"M9 21H3v-6",key:"wtvkvv"}]],F=p("maximize-2",L);const R=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],U=p("settings",R);const T=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],_=p("upload",T),P=({onGenerate:b})=>{const[m,f]=n.useState(""),[g,y]=n.useState("TC_001"),[i,u]=n.useState([]),[j,c]=n.useState(!1),[h,d]=n.useState(null),x=n.useRef(null);n.useEffect(()=>{const r=a=>{const t=a.clipboardData.items,s=[];for(let o=0;o<t.length;o++)if(t[o].type.indexOf("image")!==-1){const D=t[o].getAsFile();s.push(D)}s.length>0&&l(s)};return window.addEventListener("paste",r),()=>{window.removeEventListener("paste",r)}},[]),n.useEffect(()=>()=>{i.forEach(r=>URL.revokeObjectURL(r.url))},[]);const w=r=>{r.preventDefault(),c(!0)},k=()=>{c(!1)},N=r=>{r.preventDefault(),c(!1);const a=Array.from(r.dataTransfer.files);l(a)},z=r=>{const a=Array.from(r.target.files);l(a)},l=r=>{const t=r.filter(s=>s.type.startsWith("image/")).map(s=>({file:s,url:URL.createObjectURL(s)}));u(s=>[...s,...t])},S=r=>{u(a=>{const t=[...a];return URL.revokeObjectURL(t[r].url),t.splice(r,1),t})},C=r=>{r.preventDefault();const a=i.map(t=>t.file);b({userStory:m,testCaseId:g,screenshots:a})};return e.jsxs("div",{className:"input-form-container",children:[e.jsxs("form",{onSubmit:C,className:"bento-grid",children:[e.jsxs("div",{className:"bento-card story-card glass-panel",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("div",{className:"icon-wrapper",children:e.jsx(I,{size:20})}),e.jsx("h3",{children:"User Story"})]}),e.jsx("textarea",{value:m,onChange:r=>f(r.target.value),placeholder:"As a user, I want to...",required:!0})]}),e.jsx("div",{className:"config-column",children:e.jsxs("div",{className:"bento-card id-card glass-panel",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("div",{className:"icon-wrapper",children:e.jsx(U,{size:20})}),e.jsx("h3",{children:"Test Case ID"})]}),e.jsx("input",{type:"text",value:g,onChange:r=>y(r.target.value),placeholder:"TC_001",required:!0})]})}),e.jsxs("div",{className:"bento-card upload-card glass-panel",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("div",{className:"icon-wrapper",children:e.jsx(_,{size:20})}),e.jsx("h3",{children:"Screenshots"})]}),e.jsxs("div",{className:`dropzone ${j?"dragging":""}`,onDragOver:w,onDragLeave:k,onDrop:N,onClick:()=>x.current?.click(),children:[e.jsx("input",{type:"file",ref:x,onChange:z,multiple:!0,accept:"image/*",hidden:!0}),e.jsxs("div",{className:"dropzone-content",children:[e.jsxs("p",{children:["Drop images here or ",e.jsx("strong",{children:"Click"})]}),e.jsx("p",{className:"sub-text",children:"Paste (Ctrl+V) supported"})]})]}),i.length>0&&e.jsx("div",{className:"thumbnail-grid",children:i.map((r,a)=>e.jsxs("div",{className:"thumbnail-item",onClick:()=>d(r.url),children:[e.jsx("img",{src:r.url,alt:`Screenshot ${a+1}`}),e.jsx("div",{className:"thumbnail-overlay",children:e.jsx(F,{size:16})}),e.jsx("button",{type:"button",className:"remove-btn",onClick:t=>{t.stopPropagation(),S(a)},children:e.jsx(v,{size:14})})]},a))})]}),e.jsx("button",{type:"submit",className:"btn-generate",children:"Generate Test Cases"})]}),h&&e.jsx("div",{className:"modal-overlay",onClick:()=>d(null),children:e.jsxs("div",{className:"modal-content",onClick:r=>r.stopPropagation(),children:[e.jsx("button",{className:"modal-close",onClick:()=>d(null),children:e.jsx(v,{size:24})}),e.jsx("img",{src:h,alt:"Full Preview"})]})}),e.jsx("style",{children:`
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
      `})]})};export{P as default};
