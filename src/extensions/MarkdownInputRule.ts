import { Extension } from '@tiptap/core'

/**
 * Markdown 快捷输入扩展
 * 支持：
 * - # + 空格 -> 标题1
 * - ## + 空格 -> 标题2
 * - ### + 空格 -> 标题3
 * - #### + 空格 -> 标题4
 */
export const MarkdownInputRule = Extension.create({
  name: 'markdownInputRule',

  addKeyboardShortcuts() {
    return {
      // 空格键触发 Markdown 转换
      ' ': ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // 获取段落开始到光标位置的内容
        const paragraphStart = $from.start
        const from = $from.pos

        if (from <= paragraphStart) {
          return false
        }

        // 获取段落文本，过滤零宽字符
        const textSlice = state.doc.textBetween(paragraphStart, from, '', '\u200B')
        const cleanText = textSlice.replace(/[\u200B-\u200D\uFEFF]/g, '')

        // 检测 # 后面跟空格
        const match = cleanText.match(/^(#{1,6})\s$/)
        if (match) {
          const level = match[1].length
          const start = paragraphStart
          const end = paragraphStart + cleanText.length

          const tr = state.tr
          tr.delete(start, end)
          tr.setBlockType(tr.mapping.map(start), tr.mapping.map(start), state.schema.nodes.heading, { level })

          editor.view.dispatch(tr)
          return true
        }

        return false
      },
    }
  },
})

export default MarkdownInputRule
