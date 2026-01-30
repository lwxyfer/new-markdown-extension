import { Extension } from '@tiptap/core'

export const KeyboardShortcutsExtension = Extension.create({
  name: 'keyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      'Enter': ({ editor }) => {
        console.log('KeyboardShortcutsExtension: Enter key pressed')

        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // 检查当前段落是否为空
        const isEmptyParagraph = $from.parent.type.name === 'paragraph' &&
          $from.parent.content.size === 0

        // 检查是否在行首
        const isAtStartOfParagraph = $from.parentOffset === 0

        // 如果在空段落行首按 Enter，直接创建新段落
        if (isEmptyParagraph && isAtStartOfParagraph) {
          console.log('KeyboardShortcutsExtension: Empty paragraph at start, creating new paragraph')
          const result = editor.commands.splitBlock({ keepMarks: false })
          return result
        }

        // 正常情况：使用 splitBlock
        const result = editor.commands.splitBlock({ keepMarks: false })

        return result
      },

      'Shift-Enter': ({ editor }) => {
        console.log('KeyboardShortcutsExtension: Shift+Enter key pressed')
        return editor.commands.setHardBreak()
      },
    }
  },
})