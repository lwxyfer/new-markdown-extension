import MarkdownIt from 'markdown-it'
import TurndownService from 'turndown'

// 配置 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

// 保存原始的 fence 渲染规则
const originalFence = md.renderer.rules.fence

// 自定义 fence 渲染规则以支持 Mermaid
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const info = token.info.trim()

  // 如果是 mermaid 代码块，渲染为特殊的 div
  if (info === 'mermaid') {
    const content = token.content
    return `<div data-type="mermaid" data-content="${md.utils.escapeHtml(content)}"></div>`
  }

  // 对于其他代码块，使用原始渲染规则
  return originalFence!(tokens, idx, options, env, self)
}

// 配置 turndown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  bulletListMarker: '-',
})

// 添加自定义规则来处理特殊元素
turndownService.addRule('taskList', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'UL' && node.getAttribute('data-type') === 'taskList'
  },
  replacement: function (_content: string, node: any) {
    const items = Array.from(node.querySelectorAll('li[data-type="taskItem"]'))
    const markdownItems = items.map((item: any) => {
      const isChecked = item.getAttribute('data-checked') === 'true'
      const text = item.textContent || ''
      return `- [${isChecked ? 'x' : ' '}] ${text}`
    }).join('\n')
    return markdownItems + '\n'
  }
})

// 添加表格规则
turndownService.addRule('table', {
  filter: ['table'],
  replacement: function (_content: string, node: any) {
    const table = node as HTMLTableElement
    const rows = Array.from(table.rows)

    if (rows.length === 0) return ''

    const markdownRows = rows.map(row => {
      const cells = Array.from(row.cells)
      return '| ' + cells.map(cell => cell.textContent || '').join(' | ') + ' |'
    })

    // 添加表头分隔线
    if (rows.length > 0) {
      const headerCells = Array.from(rows[0].cells)
      const separator = '| ' + headerCells.map(() => '---').join(' | ') + ' |'
      markdownRows.splice(1, 0, separator)
    }

    return markdownRows.join('\n') + '\n'
  }
})

// 添加 Mermaid 规则
turndownService.addRule('mermaid', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'DIV' && node.getAttribute('data-type') === 'mermaid'
  },
  replacement: function (_content: string, node: any) {
    const mermaidContent = node.getAttribute('data-content') || ''
    return `\`\`\`mermaid\n${mermaidContent}\n\`\`\`\n`
  }
})

// 添加代码块规则
turndownService.addRule('codeBlock', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE'
  },
  replacement: function (_content: string, node: any) {
    const codeElement = node.firstChild as HTMLElement
    const language = codeElement.className?.replace('language-', '') || ''
    const code = codeElement.textContent || ''
    return `\`\`\`${language}\n${code}\n\`\`\`\n`
  }
})


// 导出工具函数
export const markdownToHtml = (markdown: string): string => {
  return md.render(markdown)
}

export const htmlToMarkdown = (html: string): string => {
  return turndownService.turndown(html)
}