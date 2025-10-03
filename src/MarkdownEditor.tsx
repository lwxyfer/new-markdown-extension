import React, { useState } from 'react'
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
import { SlashCommand } from './SlashCommand'
import MenuBar from './MenuBar'
import { MarkdownEditorProps } from './types'
import { markdownToHtml, htmlToMarkdown } from './markdownUtils'
import { MermaidExtension } from './MermaidExtension'
import { CodeBlockExtension } from './CodeBlockExtension'

const defaultContent = `
# 欢迎使用 TipTap Markdown 编辑器

这是一个基于 **TipTap v3** 的现代化 Markdown 编辑器，提供所见即所得的编辑体验。

## 主要功能

- ✅ 富文本编辑（粗体、斜体、下划线等）
- ✅ 标题层级（H1-H6）
- ✅ 列表（有序、无序、任务列表）
- ✅ 代码块和语法高亮
- ✅ 表格支持
- ✅ 图片和链接
- ✅ 斜杠命令快速插入

## 快速开始

试试这些功能：

1. 输入 \`/\` 查看所有可用命令
2. 使用工具栏按钮格式化文本
3. 尝试插入表格、代码块等

## 代码示例

\`\`\`javascript
function helloWorld() {
  console.log("Hello, TipTap!");
  return "这是一个代码块示例";
}
\`\`\`

## Mermaid 图表示例

\`\`\`mermaid
graph TD
    A[开始] --> B{是否理解?}
    B -->|是| C[很好!]
    B -->|否| D[再试一次]
    D --> B
    C --> E[完成]
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant A as 用户
    participant B as 编辑器
    A->>B: 输入内容
    B->>B: 渲染图表
    B-->>A: 显示结果
\`\`\`

## 任务列表

- [ ] 学习 TipTap 编辑器
- [x] 安装项目依赖
- [ ] 开始创作内容

## 表格示例

| 功能 | 状态 | 说明 |
|------|------|------|
| 文本编辑 | ✅ 完成 | 支持所有基本格式 |
| 表格 | ✅ 完成 | 可调整大小的表格 |
| 代码高亮 | ✅ 完成 | 支持多种编程语言 |

> 提示：您可以使用工具栏或快捷键来快速格式化文本。

开始创作吧！🎉
`

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ content = defaultContent, onChange }) => {
  const [isLoading, setIsLoading] = useState(true)


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockExtension,
      Table.configure({ resizable: true }),
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
      MermaidExtension,
      SlashCommand,
    ],
    content: markdownToHtml(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      onChange?.(markdown)
    },
    onCreate: () => {
      setIsLoading(false)
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        const text = clipboardData.getData('text/plain')
        console.log('Pasted content:', text) // Debug log

        let markdownContent = text

        // Check if the pasted content is wrapped in ```markdown code block
        // Handles variations: ```markdown, ```md, and different line endings
        const markdownCodeBlockRegex = /^```(?:markdown|md)\s*\n([\s\S]*?)\n```$/m
        const match = text.match(markdownCodeBlockRegex)
        console.log('Regex match:', match) // Debug log

        if (match) {
          // Extract the actual markdown content from code block
          markdownContent = match[1]
          console.log('Extracted content from code block:', markdownContent) // Debug log
        }

        // Override the clipboard data
        event.preventDefault()

        // Convert Markdown to HTML using our markdownUtils
        const htmlContent = markdownToHtml(markdownContent)
        console.log('Converted HTML content:', htmlContent) // Debug log

        // Use TipTap's insertContent method with the HTML content
        // This will properly render all elements including code blocks and mermaid
        const { state, dispatch } = view
        const { from } = state.selection

        // Clear the current selection first
        const clearTr = state.tr.delete(from, from)
        dispatch(clearTr)

        // Use insertContent to insert the HTML
        // We need to use the editor's command system
        editor?.commands.insertContent(htmlContent)

        return true
      },
    },
  })

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
    <div className="markdown-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default MarkdownEditor