import React, { useState, useRef, useEffect } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

interface CodeBlockComponentProps {
  node: {
    attrs: {
      language?: string
    }
  }
  updateAttributes: (attrs: { language: string }) => void
}

const CodeBlockComponent: React.FC<CodeBlockComponentProps> = ({ node, updateAttributes }) => {
  const language = node.attrs.language || 'plaintext'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Common programming languages
  const languages = [
    { value: 'plaintext', label: 'TEXT' },
    { value: 'javascript', label: 'JS' },
    { value: 'typescript', label: 'TS' },
    { value: 'python', label: 'PY' },
    { value: 'java', label: 'JAVA' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'MD' },
    { value: 'bash', label: 'BASH' },
    { value: 'shell', label: 'SHELL' },
    { value: 'sql', label: 'SQL' },
    { value: 'yaml', label: 'YAML' },
    { value: 'xml', label: 'XML' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'GO' },
    { value: 'rust', label: 'RUST' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'RUBY' },
    { value: 'swift', label: 'SWIFT' },
    { value: 'kotlin', label: 'KOTLIN' },
  ]

  // Format language for display
  const formatLanguage = (lang: string) => {
    const found = languages.find(l => l.value === lang)
    return found ? found.label : lang.toUpperCase()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (newLanguage: string) => {
    updateAttributes({ language: newLanguage })
    setIsDropdownOpen(false)
  }

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-container">
        <div className="code-block-header">
          <div className="language-selector" ref={dropdownRef}>
            <button
              className="language-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="Change language"
            >
              <span className="code-language">
                {formatLanguage(language)}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="language-dropdown">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    className={`language-option ${lang.value === language ? 'selected' : ''}`}
                    onClick={() => handleLanguageChange(lang.value)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <pre className="code-block-content">
          <NodeViewContent as="div" />
        </pre>
      </div>
    </NodeViewWrapper>
  )
}

export default CodeBlockComponent