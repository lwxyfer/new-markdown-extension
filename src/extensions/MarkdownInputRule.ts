import { Extension } from '@tiptap/core'

/**
 * Markdown 快捷输入扩展
 * 支持：
 * - # -> 标题1
 * - ## -> 标题2
 * - ### -> 标题3
 * - #### -> 标题4
 */
export const MarkdownInputRule = Extension.create({
  name: 'markdownInputRule',

  addEditorProps() {
    return {
      handleTextInput: (view, from, to, text) => {
        const { state } = view

        // 只处理空格键
        if (text !== ' ' || from === 0) {
          return false
        }

        // 获取光标前最多10个字符
        const beforeText = state.doc.textBetween(Math.max(0, from - 10), from)

        // 检测 # 标题
        const headingMatch = beforeText.match(/(#{1,6})\s*$/)
        if (headingMatch) {
          const level = headingMatch[1].length
          const start = from - headingMatch[0].length

          const tr = state.tr.delete(start, from)
          tr.setBlockType(tr.mapping.map(start), tr.mapping.map(start), state.schema.nodes.heading, { level })

          view.dispatch(tr)
          return true
        }

        return false
      },
    }
  },
})

export default MarkdownInputRule
