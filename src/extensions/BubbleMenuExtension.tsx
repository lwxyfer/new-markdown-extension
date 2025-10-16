import React, { useState } from 'react'
import { BubbleMenu } from '@tiptap/react/menus'
import ImageDialog from '../components/ImageDialog'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Link,
  Image,
  Quote,
  Code2
} from 'lucide-react'

interface BubbleMenuProps {
  editor: any
}

const BubbleMenuExtension: React.FC<BubbleMenuProps> = ({ editor }) => {
  const [showImageDialog, setShowImageDialog] = useState(false)

  if (!editor) return null

  return (
    <BubbleMenu
      editor={editor}
      className="bubble-menu"
    >
      <div className="bubble-menu-content">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`bubble-menu-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="粗体"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`bubble-menu-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="斜体"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`bubble-menu-btn ${editor.isActive('underline') ? 'active' : ''}`}
          title="下划线"
        >
          <Underline size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`bubble-menu-btn ${editor.isActive('strike') ? 'active' : ''}`}
          title="删除线"
        >
          <Strikethrough size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`bubble-menu-btn ${editor.isActive('code') ? 'active' : ''}`}
          title="内联代码"
        >
          <Code size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`bubble-menu-btn ${editor.isActive('highlight') ? 'active' : ''}`}
          title="高亮"
        >
          <Highlighter size={14} />
        </button>
        <button
          onClick={() => {
            const url = window.prompt('请输入链接 URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`bubble-menu-btn ${editor.isActive('link') ? 'active' : ''}`}
          title="链接"
        >
          <Link size={14} />
        </button>
        <button
          onClick={() => setShowImageDialog(true)}
          className="bubble-menu-btn"
          title="插入图片"
        >
          <Image size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`bubble-menu-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
          title="引用"
        >
          <Quote size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`bubble-menu-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="代码块"
        >
          <Code2 size={14} />
        </button>
      </div>

      <ImageDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onConfirm={(url) => {
          editor.chain().focus().setImage({ src: url }).run()
        }}
        title="插入图片"
        placeholder="请输入图片 URL"
      />
    </BubbleMenu>
  )
}

export default BubbleMenuExtension