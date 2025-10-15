import React, { useState, useEffect, useRef, useCallback } from 'react'
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
import { TableOfContents } from '@tiptap/extension-table-of-contents'
import { SlashCommand } from './SlashCommand'
import MenuBar from './MenuBar'
import TOC from './TOC'
import { markdownToHtml, htmlToMarkdown } from '../utils/markdownUtils'
import { MermaidExtension } from '../extensions/MermaidExtension'
import { CodeBlockExtension } from '../extensions/CodeBlockExtension'
import BubbleMenuExtension from '../extensions/BubbleMenuExtension'
import { ImageExtension } from '../extensions/ImageExtension'
import { isReadyMessage } from '../core/messageTypes'

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
  const [isTocCollapsed, setIsTocCollapsed] = useState(false)
  const [tocItems, setTocItems] = useState<any[]>([])
  const isInitializingRef = useRef(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          HTMLAttributes: {
            class: 'heading',
          },
        },
      }),
      CodeBlockExtension,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ImageExtension,
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
      TableOfContents.configure({
        onUpdate: (content) => {
          setTocItems(content)
        },
      }),
    ],
    content: markdownToHtml(initialContent),
    onUpdate: ({ editor }) => {
      console.log('Editor onUpdate triggered')

      // 跳过初始化时的更新
      if (isInitializingRef.current) {
        console.log('Skipping initial update')
        return
      }

      // 发送编辑内容到 VSCode
      const markdownContent = htmlToMarkdown(editor.getHTML())
      sendEdit(markdownContent)

      // 保存状态到 VSCode
      vscode.setState({ content: markdownContent })
    },
    onCreate: () => {
      setIsLoading(false)

      // 初始化完成，允许后续的更新
      isInitializingRef.current = false

      // 通知 VSCode webview 已准备就绪
      vscode.postMessage({
        type: 'ready'
      })

      // 恢复之前的状态
      const savedState = vscode.getState()
      if (savedState?.content) {
        console.log('Restoring saved state')
        const htmlContent = markdownToHtml(savedState.content)
        editor?.commands.setContent(htmlContent)
      }
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

      if (isReadyMessage(message)) {
        // 处理 ready 消息
        console.log('Webview ready message received')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 发送编辑内容到 VSCode
  const sendEdit = useCallback((content: string) => {
    vscode.postMessage({
      type: 'edit',
      content: content
    })
  }, [])

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
      <div className="editor-container">
        <TOC
          editor={editor}
          tocItems={tocItems}
          onToggle={(collapsed) => setIsTocCollapsed(collapsed)}
        />
        <div className={`editor-content ${isTocCollapsed ? 'no-toc' : ''}`}>
          <EditorContent editor={editor} />
          <BubbleMenuExtension editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default VSCodeMarkdownEditor