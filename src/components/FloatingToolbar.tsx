import React, { useState, useEffect, useRef } from 'react'

interface FloatingToolbarProps {
  editor: any
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ editor }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor) return

    const updateToolbar = () => {
      const { from, to } = editor.state.selection

      // Only show toolbar for non-empty selections
      if (from === to) {
        setIsVisible(false)
        return
      }

      // Get selection coordinates
      const { view } = editor
      const start = view.coordsAtPos(from)
      const end = view.coordsAtPos(to)

      // Calculate position
      const top = Math.min(start.top, end.top) - 50
      const left = (start.left + end.left) / 2

      setPosition({ top, left })
      setIsVisible(true)
    }

    const hideToolbar = () => {
      setIsVisible(false)
    }

    // Listen for selection changes
    editor.on('selectionUpdate', updateToolbar)
    editor.on('blur', hideToolbar)

    // Hide toolbar when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      editor.off('selectionUpdate', updateToolbar)
      editor.off('blur', hideToolbar)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editor])

  if (!isVisible || !editor) return null

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="floating-toolbar-content">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`floating-toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="粗体"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`floating-toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="斜体"
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`floating-toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
          title="下划线"
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`floating-toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
          title="删除线"
        >
          S
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`floating-toolbar-btn ${editor.isActive('code') ? 'active' : ''}`}
          title="代码"
        >
          &lt;/&gt;
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`floating-toolbar-btn ${editor.isActive('highlight') ? 'active' : ''}`}
          title="高亮"
        >
          🖍️
        </button>
        <button
          onClick={() => {
            const url = window.prompt('请输入链接 URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`floating-toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
          title="链接"
        >
          🔗
        </button>
      </div>
    </div>
  )
}

export default FloatingToolbar