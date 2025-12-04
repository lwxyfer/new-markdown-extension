import React, { useState } from 'react'
import { MenuBarProps } from '../types/types'
import ImageDialog from './ImageDialog'
import FormulaDialog from './FormulaDialog'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  SquareCheck,
  Quote,
  Code2,
  Table,
  Image,
  Link,
  Workflow,
  // Square,
  Sigma,
  SquareSigma,
} from 'lucide-react'

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showMathDialog, setShowMathDialog] = useState(false)
  const [mathType, setMathType] = useState<'inline' | 'block'>('inline')

  if (!editor) {
    return null
  }

  return (
    <div className="notion-toolbar">
      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`notion-button ${editor.isActive('bold') ? 'notion-button-active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`notion-button ${editor.isActive('italic') ? 'notion-button-active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`notion-button ${editor.isActive('underline') ? 'notion-button-active' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`notion-button ${editor.isActive('strike') ? 'notion-button-active' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`notion-button ${editor.isActive('code') ? 'notion-button-active' : ''}`}
          title="Inline Code"
        >
          <Code size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`notion-button ${editor.isActive('highlight') ? 'notion-button-active' : ''}`}
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`notion-button ${editor.isActive('paragraph') ? 'notion-button-active' : ''}`}
          title="Paragraph"
        >
          <Type size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`notion-button ${editor.isActive('heading', { level: 1 }) ? 'notion-button-active' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`notion-button ${editor.isActive('heading', { level: 2 }) ? 'notion-button-active' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`notion-button ${editor.isActive('heading', { level: 3 }) ? 'notion-button-active' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`notion-button ${editor.isActive('bulletList') ? 'notion-button-active' : ''}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`notion-button ${editor.isActive('orderedList') ? 'notion-button-active' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`notion-button ${editor.isActive('taskList') ? 'notion-button-active' : ''}`}
          title="Task List"
        >
          <SquareCheck size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`notion-button ${editor.isActive('blockquote') ? 'notion-button-active' : ''}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`notion-button ${editor.isActive('codeBlock') ? 'notion-button-active' : ''}`}
          title="Code Block"
        >
          <Code2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={`notion-button ${editor.isActive('table') ? 'notion-button-active' : ''}`}
          title="Table"
        >
          <Table size={16} />
        </button>
        <button
          onClick={() => setShowImageDialog(true)}
          className="notion-button"
          title="Insert Image"
        >
          <Image size={16} />
        </button>
        <button
          onClick={() => {
            setMathType('inline')
            setShowMathDialog(true)
          }}
          className="notion-button"
          title="Insert Inline Math"
        >
          <Sigma size={16} />
        </button>
        <button
          onClick={() => {
            setMathType('block')
            setShowMathDialog(true)
          }}
          className="notion-button"
          title="Insert Block Math"
        >
          <SquareSigma size={16} />
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter link URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`notion-button ${editor.isActive('link') ? 'notion-button-active' : ''}`}
          title="Insert Link"
        >
          <Link size={16} />
        </button>
        <button
          onClick={() => {
            editor.chain().focus().insertContent({
              type: 'mermaid',
              content: [
                {
                  type: 'text',
                  text: 'graph TD\n  A[Start] --> B[Process Data]\n  B --> C{Decision}\n  C -->|Yes| D[Success]\n  C -->|No| E[Failure]\n  D --> F[End]\n  E --> F'
                }
              ]
            }).run()
          }}
          className="notion-button"
          title="Insert Mermaid Diagram"
        >
          <Workflow size={16} />
        </button>
      </div>

      <ImageDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onConfirm={(url) => {
          editor.chain().focus().setImage({ src: url }).run()
        }}
        title="Insert Image"
        placeholder="Enter image URL"
      />

      <FormulaDialog
        isOpen={showMathDialog}
        onClose={() => setShowMathDialog(false)}
        onConfirm={(formula) => {
          if (mathType === 'inline') {
            editor.chain().focus().insertInlineMath({ latex: formula }).run()
          } else {
            editor.chain().focus().insertBlockMath({ latex: formula }).run()
          }
        }}
        title={mathType === 'inline' ? 'Insert Inline Math' : 'Insert Block Math'}
        placeholder="Enter LaTeX formula"
        mathType={mathType}
      />

    </div>
  )
}

export default MenuBar