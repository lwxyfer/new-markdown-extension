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
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`bubble-menu-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`bubble-menu-btn ${editor.isActive('underline') ? 'active' : ''}`}
          title="Underline"
        >
          <Underline size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`bubble-menu-btn ${editor.isActive('strike') ? 'active' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`bubble-menu-btn ${editor.isActive('code') ? 'active' : ''}`}
          title="Inline Code"
        >
          <Code size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`bubble-menu-btn ${editor.isActive('highlight') ? 'active' : ''}`}
          title="Highlight"
        >
          <Highlighter size={14} />
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter link URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`bubble-menu-btn ${editor.isActive('link') ? 'active' : ''}`}
          title="Link"
        >
          <Link size={14} />
        </button>
        <button
          onClick={() => setShowImageDialog(true)}
          className="bubble-menu-btn"
          title="Insert Image"
        >
          <Image size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`bubble-menu-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
          title="Quote"
        >
          <Quote size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`bubble-menu-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="Code Block"
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
        title="Insert Image"
        placeholder="Enter image URL"
      />
    </BubbleMenu>
  )
}

export default BubbleMenuExtension