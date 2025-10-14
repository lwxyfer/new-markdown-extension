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
import { SlashCommand } from './SlashCommand'
import MenuBar from './MenuBar'
import { markdownToHtml, htmlToMarkdown } from '../utils/markdownUtils'
import { MermaidExtension } from '../extensions/MermaidExtension'
import { CodeBlockExtension } from '../extensions/CodeBlockExtension'
import BubbleMenuExtension from '../extensions/BubbleMenuExtension'
import { debounce } from '../utils/debounce'
import { isUpdateMessage, isReadyMessage } from '../core/messageTypes'

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
  const ignoreNextUpdateRef = useRef(false)

  // 防抖发送内容更新到 VSCode
  const debouncedSendContent = useCallback(
    debounce((content: string) => {
      vscode.postMessage({
        type: 'add',
        text: content
      })
    }, 200),
    []
  )

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
      // 如果设置了忽略下一个更新，则跳过
      if (ignoreNextUpdateRef.current) {
        console.log('Skipping onUpdate due to ignore flag')
        ignoreNextUpdateRef.current = false
        return
      }

      console.log('Editor onUpdate triggered')

      // 使用防抖机制发送内容更新
      const markdownContent = htmlToMarkdown(editor.getHTML())
      debouncedSendContent(markdownContent)

      // 保存状态到 VSCode
      vscode.setState({ content: markdownContent })
    },
    onCreate: () => {
      setIsLoading(false)

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

      if (isUpdateMessage(message)) {
        // 当文档内容在外部被修改时更新编辑器
        if (editor && message.text !== undefined) {
          console.log('Received update message')

          // 保存当前光标位置和选择范围
          const currentPos = editor.state.selection.anchor
          const selection = editor.state.selection
          console.log('Current cursor position:', currentPos, 'Selection:', selection)

          // 获取当前文档内容用于比较
          const currentMarkdown = htmlToMarkdown(editor.getHTML())

          // 设置忽略下一个更新的标志
          ignoreNextUpdateRef.current = true

          const htmlContent = markdownToHtml(message.text)
          editor.commands.setContent(htmlContent)

          // 尝试恢复光标位置 - 使用更智能的方法
          setTimeout(() => {
            if (editor) {
              // 计算新文档的大小
              const newDocSize = editor.state.doc.content.size
              console.log('New document size:', newDocSize)

              // 如果文档结构变化不大，尝试恢复原始位置
              if (currentPos <= newDocSize) {
                console.log('Restoring cursor to original position:', currentPos)
                editor.commands.setTextSelection(currentPos)
              } else {
                // 如果位置超出范围，将光标放在文档末尾
                console.log('Cursor position out of bounds, moving to end:', currentPos, 'doc size:', newDocSize)
                editor.commands.setTextSelection(newDocSize)
              }
            }
          }, 50) // 增加延迟确保内容完全加载

          console.log('External update processing completed')
        }
      } else if (isReadyMessage(message)) {
        // 处理 ready 消息
        console.log('Webview ready message received')
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