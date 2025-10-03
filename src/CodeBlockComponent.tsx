import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

interface CodeBlockComponentProps {
  node: {
    attrs: {
      language?: string
    }
  }
}

const CodeBlockComponent: React.FC<CodeBlockComponentProps> = ({ node }) => {
  const language = node.attrs.language || 'plaintext'

  // Format language for display
  const formatLanguage = (lang: string) => {
    if (lang === 'plaintext') return 'TEXT'
    if (lang === 'javascript') return 'JS'
    if (lang === 'typescript') return 'TS'
    if (lang === 'python') return 'PY'
    if (lang === 'java') return 'JAVA'
    if (lang === 'css') return 'CSS'
    if (lang === 'html') return 'HTML'
    if (lang === 'json') return 'JSON'
    if (lang === 'markdown') return 'MD'
    if (lang === 'bash') return 'BASH'
    if (lang === 'shell') return 'SHELL'
    if (lang === 'sql') return 'SQL'
    if (lang === 'yaml') return 'YAML'
    if (lang === 'xml') return 'XML'
    return lang.toUpperCase()
  }

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-container">
        <div className="code-block-header">
          <span className="code-language">
            {formatLanguage(language)}
          </span>
        </div>
        <pre className="code-block-content">
          <NodeViewContent as="code" />
        </pre>
      </div>
    </NodeViewWrapper>
  )
}

export default CodeBlockComponent