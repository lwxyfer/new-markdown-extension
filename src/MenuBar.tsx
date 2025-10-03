import React from 'react'
import { MenuBarProps } from './types'

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="notion-toolbar">
      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`notion-button ${editor.isActive('bold') ? 'notion-button-active' : ''}`}
          title="粗体 (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`notion-button ${editor.isActive('italic') ? 'notion-button-active' : ''}`}
          title="斜体 (Ctrl+I)"
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`notion-button ${editor.isActive('underline') ? 'notion-button-active' : ''}`}
          title="下划线 (Ctrl+U)"
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`notion-button ${editor.isActive('strike') ? 'notion-button-active' : ''}`}
          title="删除线"
        >
          S
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`notion-button ${editor.isActive('code') ? 'notion-button-active' : ''}`}
          title="内联代码"
        >
          &lt;/&gt;
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`notion-button ${editor.isActive('highlight') ? 'notion-button-active' : ''}`}
          title="高亮"
        >
          🖍️
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`notion-button ${editor.isActive('paragraph') ? 'notion-button-active' : ''}`}
          title="段落"
        >
          文本
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`notion-button ${editor.isActive('heading', { level: 1 }) ? 'notion-button-active' : ''}`}
          title="标题 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`notion-button ${editor.isActive('heading', { level: 2 }) ? 'notion-button-active' : ''}`}
          title="标题 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`notion-button ${editor.isActive('heading', { level: 3 }) ? 'notion-button-active' : ''}`}
          title="标题 3"
        >
          H3
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`notion-button ${editor.isActive('bulletList') ? 'notion-button-active' : ''}`}
          title="无序列表"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`notion-button ${editor.isActive('orderedList') ? 'notion-button-active' : ''}`}
          title="有序列表"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`notion-button ${editor.isActive('taskList') ? 'notion-button-active' : ''}`}
          title="任务列表"
        >
          ☐
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`notion-button ${editor.isActive('blockquote') ? 'notion-button-active' : ''}`}
          title="引用"
        >
          &gt;
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`notion-button ${editor.isActive('codeBlock') ? 'notion-button-active' : ''}`}
          title="代码块"
        >
          ```
        </button>
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={`notion-button ${editor.isActive('table') ? 'notion-button-active' : ''}`}
          title="表格"
        >
          📊
        </button>
        <button
          onClick={() => {
            const url = window.prompt('请输入图片 URL:')
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}
          className="notion-button"
          title="插入图片"
        >
          🖼️
        </button>
        <button
          onClick={() => {
            const url = window.prompt('请输入链接 URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`notion-button ${editor.isActive('link') ? 'notion-button-active' : ''}`}
          title="插入链接"
        >
          🔗
        </button>
        <button
          onClick={() => {
            editor.chain().focus().insertContent({
              type: 'mermaid',
              content: [
                {
                  type: 'text',
                  text: 'graph TD\n  A[开始] --> B[处理数据]\n  B --> C{决策}\n  C -->|是| D[成功]\n  C -->|否| E[失败]\n  D --> F[结束]\n  E --> F'
                }
              ]
            }).run()
          }}
          className="notion-button"
          title="插入 Mermaid 图表"
        >
          📊
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`notion-button ${editor.isActive({ textAlign: 'left' }) ? 'notion-button-active' : ''}`}
          title="左对齐"
        >
          ←
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`notion-button ${editor.isActive({ textAlign: 'center' }) ? 'notion-button-active' : ''}`}
          title="居中对齐"
        >
          ↔
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`notion-button ${editor.isActive({ textAlign: 'right' }) ? 'notion-button-active' : ''}`}
          title="右对齐"
        >
          →
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="notion-button"
          title="撤销 (Ctrl+Z)"
        >
          ↩️
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="notion-button"
          title="重做 (Ctrl+Y)"
        >
          ↪️
        </button>
      </div>
    </div>
  )
}

export default MenuBar