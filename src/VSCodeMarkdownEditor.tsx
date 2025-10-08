import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { SlashCommand } from './SlashCommand'
import MenuBar from './MenuBar'
import { markdownToHtml, htmlToMarkdown } from './markdownUtils'
import { MermaidExtension } from './MermaidExtension'
import { CodeBlockExtension } from './CodeBlockExtension'
import BubbleMenuExtension from './BubbleMenuExtension'

// 声明全局的 vscode API
declare global {
  const vscode: {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
  };
}

interface VSCodeMarkdownEditorProps {
  initialContent: string;
}

const VSCodeMarkdownEditor: React.FC<VSCodeMarkdownEditorProps> = ({ initialContent }) => {
  const [isLoading, setIsLoading] = useState(true)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockExtension,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: '使用 / 触发命令',
      }),
      Gapcursor,
      MermaidExtension,
      SlashCommand,
    ],
    content: markdownToHtml(initialContent),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)

      // 发送内容变化消息给 VSCode
      vscode.postMessage({
        type: 'contentChanged',
        content: markdown
      })
    },
    onCreate: () => {
      setIsLoading(false)

      // 通知 VSCode webview 已准备就绪
      vscode.postMessage({
        type: 'ready'
      })
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        const text = clipboardData.getData('text/plain')

        let markdownContent = text

        // Check if the pasted content is wrapped in ```markdown code block
        const markdownCodeBlockRegex = /^```(?:markdown|md)\s*\n([\s\S]*?)\n```$/m
        const match = text.match(markdownCodeBlockRegex)

        if (match) {
          // Extract the actual markdown content from code block
          markdownContent = match[1]
        }

        // Override the clipboard data
        event.preventDefault()

        // Convert Markdown to HTML using our markdownUtils
        const htmlContent = markdownToHtml(markdownContent)

        // Use TipTap's insertContent method with the HTML content
        const { state, dispatch } = view
        const { from } = state.selection

        // Clear the current selection first
        const clearTr = state.tr.delete(from, from)
        dispatch(clearTr)

        // Use insertContent to insert the HTML
        editor?.commands.insertContent(htmlContent)

        return true
      },
    },
  })

  // 监听来自 VSCode 的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data

      switch (message.type) {
        case 'update':
          // 当文档内容在外部被修改时更新编辑器
          if (editor && message.content !== undefined) {
            const htmlContent = markdownToHtml(message.content)
            editor.commands.setContent(htmlContent)
          }
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [editor])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: '#666'
      }}>
        编辑器加载中...
      </div>
    )
  }

  return (
    <div className="vscode-markdown-editor">
      <MenuBar editor={editor} />
      <div style={{ position: 'relative' }}>
        <EditorContent editor={editor} />
        <BubbleMenuExtension editor={editor} />
      </div>
    </div>
  )
}

export default VSCodeMarkdownEditor