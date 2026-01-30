import { Paragraph } from '@tiptap/extension-paragraph'

export const ParagraphBehaviorExtension = Paragraph.extend({
  addKeyboardShortcuts() {
    return {
      'Enter': ({ editor }) => {
        // 获取当前状态
        const { state } = editor
        const { selection } = state
        const { $from, $to } = selection

        // 检查是否在空段落中（段落只有换行符或为空）
        const isEmptyParagraph = $from.parent.type.name === 'paragraph' &&
          $from.parent.content.size === 0

        // 检查是否在行首
        const isAtStartOfParagraph = $from.parentOffset === 0 &&
          $from.index($from.depth) === 0

        // 检查是否在行尾
        const isAtEndOfParagraph = $to.parentOffset === $from.parent.content.size

        console.log('Enter key pressed:', {
          isEmptyParagraph,
          isAtStartOfParagraph,
          isAtEndOfParagraph,
          parentType: $from.parent.type.name,
          parentContentSize: $from.parent.content.size,
          parentOffset: $from.parentOffset
        })

        // 执行 splitBlock 创建新段落
        const result = editor.commands.splitBlock({ keepMarks: false })

        // 如果 splitBlock 成功，在新段落中插入零宽字符，确保光标可以进入
        if (result) {
          // 插入零宽字符作为光标锚点
          editor.commands.insertContent('\u200B')
        } else if (isEmptyParagraph) {
          // 如果在空段落中，splitBlock 可能失败，尝试 createParagraphNear
          const paraResult = editor.commands.createParagraphNear()
          if (paraResult) {
            editor.commands.insertContent('\u200B')
          }
          return paraResult
        }

        return result
      },
      'Shift-Enter': ({ editor }) => {
        // Shift+Enter 创建硬换行
        return editor.commands.setHardBreak()
      },
    }
  },
})