import { Editor } from '@tiptap/react'

export interface SuggestionItem {
  title: string
  description: string
  icon: string
  command: ({ editor, range }: { editor: Editor; range: any }) => void | { type: 'image' } | { type: 'math'; mathType: 'inline' | 'block' }
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
  editor?: any
  range?: any
}

export interface SearchHighlightOptions {
  searchQuery: string
  currentMatchIndex: number
  searchResults: Array<{ start: number; end: number }>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    updateSearchHighlight: {
      updateSearchHighlight: (options: Partial<SearchHighlightOptions>) => ReturnType
    }
  }
}