import React from 'react'
import ReactDOM from 'react-dom/client'
import VSCodeMarkdownEditor from './VSCodeMarkdownEditor'
import './index.css'
import './notion.css'

// Get the initial content from VSCode
const initialContent = (window as any).initialContent || '';

console.log('📄 Initial content received:', initialContent);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VSCodeMarkdownEditor initialContent={initialContent} />
  </React.StrictMode>,
)