import{r as s,j as e}from"./index-O48r6BTw.js";import{l as g,n as b,o as m,p as f,_ as h,M as y,L as w,O as k,S,q as j}from"./components-D2_vjPdQ.js";/**
 * @remix-run/react v2.17.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let a="positions";function v({getKey:t,...d}){let{isSpaMode:p}=g(),i=b(),l=m();f({getKey:t,storageKey:a});let x=s.useMemo(()=>{if(!t)return null;let r=t(i,l);return r!==i.key?r:null},[]);if(p)return null;let c=((r,u)=>{if(!window.history.state||!window.history.state.key){let o=Math.random().toString(32).slice(2);window.history.replaceState({key:o},"")}try{let n=JSON.parse(sessionStorage.getItem(r)||"{}")[u||window.history.state.key];typeof n=="number"&&window.scrollTo(0,n)}catch(o){console.error(o),sessionStorage.removeItem(r)}}).toString();return s.createElement("script",h({},d,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${c})(${JSON.stringify(a)}, ${JSON.stringify(x)})`}}))}function _(){return e.jsxs("html",{lang:"en",children:[e.jsxs("head",{children:[e.jsx(y,{}),e.jsx(w,{}),e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),e.jsx("title",{children:"Sortable Form"}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
            * {
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              display: grid;
              grid-template-columns: 1fr 300px;
              gap: 20px;
            }
            .form-section {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .sidebar {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              height: fit-content;
            }
            .parent-item {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 15px;
              border-radius: 6px;
              background: #fafafa;
            }
            .parent-header {
              display: flex;
              gap: 10px;
              align-items: center;
              margin-bottom: 10px;
            }
            .parent-input {
              flex: 1;
              padding: 8px;
              border: 1px solid #ccc;
              border-radius: 4px;
            }
            .children-container {
              margin-top: 15px;
              padding: 10px;
              background: white;
              border-radius: 4px;
              border: 1px solid #e0e0e0;
            }
            .child-item {
              display: flex;
              gap: 10px;
              align-items: center;
              padding: 8px;
              margin-bottom: 8px;
              background: #f9f9f9;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
              cursor: move;
            }
            .child-input {
              flex: 1;
              padding: 6px;
              border: 1px solid #ccc;
              border-radius: 3px;
            }
            .drag-handle {
              cursor: move;
              color: #666;
              font-size: 18px;
              line-height: 1;
            }
            .add-button {
              background: #007bff;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 4px;
              cursor: pointer;
            }
            .add-button:hover {
              background: #0056b3;
            }
            .remove-button {
              background: #dc3545;
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 3px;
              cursor: pointer;
              font-size: 12px;
            }
            .remove-button:hover {
              background: #c82333;
            }
            .sidebar h3 {
              margin-top: 0;
              color: #333;
            }
            .index-list {
              list-style: none;
              padding: 0;
            }
            .index-item {
              padding: 8px;
              margin-bottom: 4px;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              font-size: 14px;
            }
            .nested-index {
              margin-left: 20px;
              margin-top: 4px;
              font-size: 12px;
              color: #666;
            }
            .sortable-ghost {
              opacity: 0.4;
            }
            .sortable-chosen {
              background: #e3f2fd !important;
            }
          `}})]}),e.jsxs("body",{children:[e.jsx(k,{}),e.jsx(v,{}),e.jsx(S,{}),e.jsx(j,{})]})]})}export{_ as default};
