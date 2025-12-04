import { Editor } from '@tiptap/react'
import { SuggestionItem } from '../types/types'

export const getSuggestionItems = ({}: { editor: Editor }): SuggestionItem[] => [
  {
    title: 'Heading 1',
    description: 'Large heading',
    icon: 'heading1',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
    },
    keywords: ['h1', 'heading1', 'title', 'large heading']
  },
  {
    title: 'Heading 2',
    description: 'Medium heading',
    icon: 'heading2',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
    },
    keywords: ['h2', 'heading2', 'subtitle', 'medium heading']
  },
  {
    title: 'Heading 3',
    description: 'Small heading',
    icon: 'heading3',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
    },
    keywords: ['h3', 'heading3', 'small heading']
  },
  {
    title: 'Text',
    description: 'Normal paragraph',
    icon: 'paragraph',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
    keywords: ['p', 'paragraph', 'text']
  },
  {
    title: 'Bold',
    description: 'Bold text',
    icon: 'bold',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBold().run()
    },
    keywords: ['bold', 'strong']
  },
  {
    title: 'Italic',
    description: 'Italic text',
    icon: 'italic',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleItalic().run()
    },
    keywords: ['italic', 'em']
  },
  {
    title: 'Code',
    description: 'Inline code',
    icon: 'code',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCode().run()
    },
    keywords: ['code', 'inline code']
  },
  {
    title: 'Code Block',
    description: 'Code block',
    icon: 'codeblock',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
    keywords: ['codeblock', 'code block']
  },
  {
    title: 'Quote',
    description: 'Quote block',
    icon: 'quote',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
    keywords: ['quote', 'blockquote']
  },
  {
    title: 'Bullet List',
    description: 'Bullet list',
    icon: 'bulletlist',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
    keywords: ['ul', 'bullet list', 'unordered list']
  },
  {
    title: 'Ordered List',
    description: 'Numbered list',
    icon: 'orderedlist',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
    keywords: ['ol', 'ordered list', 'numbered list']
  },
  {
    title: 'Task List',
    description: 'Checkbox list',
    icon: 'tasklist',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
    keywords: ['task list', 'todo', 'checklist']
  },
  {
    title: 'Table',
    description: 'Insert table',
    icon: 'table',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
    keywords: ['table']
  },
  {
    title: 'Image',
    description: 'Insert image',
    icon: 'image',
    command: ({ editor, range }) => {
      return { type: 'image', editor, range }
    },
    keywords: ['image', 'img', 'picture']
  },
  {
    title: 'Link',
    description: 'Insert link',
    icon: 'link',
    command: ({ editor, range }) => {
      const url = window.prompt('Enter link URL:')
      if (url) {
        editor.chain().focus().deleteRange(range).setLink({ href: url }).run()
      }
    },
    keywords: ['link', 'url']
  },
  {
    title: 'Mermaid Diagram',
    description: 'Insert Mermaid diagram',
    icon: 'mermaid',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent({
        type: 'mermaid',
        content: [
          {
            type: 'text',
            text: 'graph TD\n  A[Start] --> B[Process Data]\n  B --> C{Decision}\n  C -->|Yes| D[Success]\n  C -->|No| E[Failure]\n  D --> F[End]\n  E --> F'
          }
        ]
      }).run()
    },
    keywords: ['mermaid', 'diagram', 'chart', 'flowchart']
  },
  {
    title: 'Inline Math',
    description: 'Insert inline math formula',
    icon: 'math',
    command: ({ editor, range }) => {
      // Return special type to be handled by SuggestionMenu
      return { type: 'math', editor, range, mathType: 'inline' }
    },
    keywords: ['math', 'formula', 'latex', 'inline']
  },
  {
    title: 'Block Math',
    description: 'Insert block math formula',
    icon: 'math',
    command: ({ editor, range }) => {
      // Return special type to be handled by SuggestionMenu
      return { type: 'math', editor, range, mathType: 'block' }
    },
    keywords: ['math', 'formula', 'latex', 'block']
  }
]

export const filterItems = (items: SuggestionItem[], query: string): SuggestionItem[] => {
  return items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  )
}