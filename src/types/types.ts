import { Editor } from '@tiptap/react'

export interface SuggestionItem {
  title: string
  description: string
  icon: string
  command: ({ editor, range }: { editor: Editor; range: any }) => void
  keywords: string[]
}

export interface MenuBarProps {
  editor: Editor | null
}

export interface MarkdownEditorProps {
  content?: string
  onChange?: (content: string) => void
}

export interface SuggestionMenuProps {
  items: SuggestionItem[]
  command: (item: SuggestionItem) => void
  selectedIndex: number
  setSelectedIndex: (index: number) => void
}