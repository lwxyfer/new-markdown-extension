import React from 'react'
import { MenuBarProps } from './types'
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
  Workflow
} from 'lucide-react'

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
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`notion-button ${editor.isActive('italic') ? 'notion-button-active' : ''}`}
          title="斜体 (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`notion-button ${editor.isActive('underline') ? 'notion-button-active' : ''}`}
          title="下划线 (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`notion-button ${editor.isActive('strike') ? 'notion-button-active' : ''}`}
          title="删除线"
        >
          <Strikethrough size={16} />
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`notion-button ${editor.isActive('code') ? 'notion-button-active' : ''}`}
          title="内联代码"
        >
          <Code size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`notion-button ${editor.isActive('highlight') ? 'notion-button-active' : ''}`}
          title="高亮"
        >
          <Highlighter size={16} />
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`notion-button ${editor.isActive('paragraph') ? 'notion-button-active' : ''}`}
          title="段落"
        >
          <Type size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`notion-button ${editor.isActive('heading', { level: 1 }) ? 'notion-button-active' : ''}`}
          title="标题 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`notion-button ${editor.isActive('heading', { level: 2 }) ? 'notion-button-active' : ''}`}
          title="标题 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`notion-button ${editor.isActive('heading', { level: 3 }) ? 'notion-button-active' : ''}`}
          title="标题 3"
        >
          <Heading3 size={16} />
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`notion-button ${editor.isActive('bulletList') ? 'notion-button-active' : ''}`}
          title="无序列表"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`notion-button ${editor.isActive('orderedList') ? 'notion-button-active' : ''}`}
          title="有序列表"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`notion-button ${editor.isActive('taskList') ? 'notion-button-active' : ''}`}
          title="任务列表"
        >
          <SquareCheck size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`notion-button ${editor.isActive('blockquote') ? 'notion-button-active' : ''}`}
          title="引用"
        >
          <Quote size={16} />
        </button>
      </div>

      <div className="notion-toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`notion-button ${editor.isActive('codeBlock') ? 'notion-button-active' : ''}`}
          title="代码块"
        >
          <Code2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={`notion-button ${editor.isActive('table') ? 'notion-button-active' : ''}`}
          title="表格"
        >
          <Table size={16} />
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
          <Image size={16} />
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
          <Link size={16} />
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
          <Workflow size={16} />
        </button>
      </div>

    </div>
  )
}

export default MenuBar