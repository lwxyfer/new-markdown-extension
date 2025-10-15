import { Editor } from '@tiptap/react'
import { SuggestionItem } from '../types/types'

export const getSuggestionItems = ({}: { editor: Editor }): SuggestionItem[] => [
  {
    title: '标题 1',
    description: '大号标题',
    icon: 'heading1',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
    },
    keywords: ['h1', 'heading1', 'title', '标题', '大标题']
  },
  {
    title: '标题 2',
    description: '中号标题',
    icon: 'heading2',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
    },
    keywords: ['h2', 'heading2', 'subtitle', '副标题', '中标题']
  },
  {
    title: '标题 3',
    description: '小号标题',
    icon: 'heading3',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
    },
    keywords: ['h3', 'heading3', 'small title', '小标题']
  },
  {
    title: '文本',
    description: '普通段落',
    icon: 'paragraph',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
    keywords: ['p', 'paragraph', '文本', '段落']
  },
  {
    title: '粗体',
    description: '加粗文本',
    icon: 'bold',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBold().run()
    },
    keywords: ['bold', '粗体', '加粗']
  },
  {
    title: '斜体',
    description: '斜体文本',
    icon: 'italic',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleItalic().run()
    },
    keywords: ['italic', '斜体']
  },
  {
    title: '代码',
    description: '内联代码',
    icon: 'code',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCode().run()
    },
    keywords: ['code', 'inline code', '代码', '内联代码']
  },
  {
    title: '代码块',
    description: '代码块',
    icon: 'codeblock',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
    keywords: ['codeblock', '代码块']
  },
  {
    title: '引用',
    description: '引用块',
    icon: 'quote',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
    keywords: ['quote', 'blockquote', '引用']
  },
  {
    title: '无序列表',
    description: '项目符号列表',
    icon: 'bulletlist',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
    keywords: ['ul', 'bullet list', '无序列表', '项目符号']
  },
  {
    title: '有序列表',
    description: '数字列表',
    icon: 'orderedlist',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
    keywords: ['ol', 'ordered list', '有序列表', '数字列表']
  },
  {
    title: '任务列表',
    description: '复选框列表',
    icon: 'tasklist',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
    keywords: ['task list', 'todo', '任务列表', '待办事项']
  },
  {
    title: '表格',
    description: '插入表格',
    icon: 'table',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
    keywords: ['table', '表格']
  },
  {
    title: '图片',
    description: '插入图片',
    icon: 'image',
    command: ({ editor, range }) => {
      const url = window.prompt('请输入图片 URL:')
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
      }
    },
    keywords: ['image', 'img', '图片']
  },
  {
    title: '链接',
    description: '插入链接',
    icon: 'link',
    command: ({ editor, range }) => {
      const url = window.prompt('请输入链接地址:')
      if (url) {
        editor.chain().focus().deleteRange(range).setLink({ href: url }).run()
      }
    },
    keywords: ['link', 'url', '链接']
  },
  {
    title: 'Mermaid 图表',
    description: '插入 Mermaid 图表',
    icon: 'mermaid',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent({
        type: 'mermaid',
        content: [
          {
            type: 'text',
            text: 'graph TD\n  A[开始] --> B[处理数据]\n  B --> C{决策}\n  C -->|是| D[成功]\n  C -->|否| E[失败]\n  D --> F[结束]\n  E --> F'
          }
        ]
      }).run()
    },
    keywords: ['mermaid', 'diagram', 'chart', '图表', '流程图']
  }
]

export const filterItems = (items: SuggestionItem[], query: string): SuggestionItem[] => {
  return items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  )
}