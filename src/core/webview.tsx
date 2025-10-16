import React from 'react'
import ReactDOM from 'react-dom/client'
import VSCodeMarkdownEditor from '../components/VSCodeMarkdownEditor'
import '../styles/index.css'
import '../styles/notion.css'
import 'katex/dist/katex.min.css'

// Get the initial content from VSCode
const initialContent = (window as any).initialContent || '';

console.log('📄 Initial content received:', initialContent);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VSCodeMarkdownEditor initialContent={initialContent} />
  </React.StrictMode>,
)