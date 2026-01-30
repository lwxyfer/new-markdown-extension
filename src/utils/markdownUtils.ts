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

// 保存原始的段落渲染规则
const originalParagraph = md.renderer.rules.paragraph

// 自定义段落渲染规则以保留空段落
md.renderer.rules.paragraph = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  // 如果段落内容为空，仍然渲染空段落
  if (!token.content || token.content.trim() === '') {
    return '<p></p>'
  }
  // 否则使用原始渲染规则
  return originalParagraph!(tokens, idx, options, env, self)
}

// 保存原始的 inline 渲染规则
const originalInline = md.renderer.rules.inline

// 自定义 inline 渲染规则以支持数学公式
md.renderer.rules.inline = (tokens, idx, options, env, self) => {
  const token = tokens[idx]

  // 检查是否是数学公式
  if (token.content.startsWith('$') && token.content.endsWith('$') && token.content.length > 2) {
    const latex = token.content.slice(1, -1)
    // 生成 TipTap 兼容的行内数学公式元素
    return `<span data-latex="${md.utils.escapeHtml(latex)}" data-type="inline-math"></span>`
  }

  // 对于其他内联元素，使用原始渲染规则
  return originalInline!(tokens, idx, options, env, self)
}

// 添加块级数学公式的渲染规则
md.renderer.rules.blockmath = (tokens, idx) => {
  const token = tokens[idx]
  const content = token.content.trim()

  // 移除前后的 $$ 和空白
  const latex = content.replace(/^\$\$\s*|\s*\$\$$/g, '')
  // 生成 TipTap 兼容的块级数学公式元素
  return `<div data-latex="${md.utils.escapeHtml(latex)}" data-type="block-math"></div>`
}

// 添加 GitHub badge 自定义渲染规则
md.renderer.rules.image = (tokens, idx, options, _env, self) => {
  const token = tokens[idx]
  const src = token.attrGet('src') || ''
  const alt = token.attrGet('alt') || ''

  // 检查是否是 badge 图片
  const isBadge = src.includes('shields.io') ||
                  src.includes('badge.fury.io') ||
                  src.includes('badges.gitter') ||
                  src.includes('badgen.net')

  if (isBadge) {
    return `<img src="${src}" alt="${alt}" data-badge="true" />`
  }

  return self.renderToken(tokens, idx, options)
}

// 添加图片链接渲染规则
md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
  const token = tokens[idx]

  // 检查链接是否包含图片
  if (idx + 2 < tokens.length) {
    const nextToken = tokens[idx + 1]
    const nextNextToken = tokens[idx + 2]

    if (nextToken.type === 'image' && nextNextToken.type === 'link_close') {
      const src = nextToken.attrGet('src') || ''
      const isBadge = src.includes('shields.io') ||
                      src.includes('badge.fury.io') ||
                      src.includes('badges.gitter') ||
                      src.includes('badgen.net')

      if (isBadge) {
        token.attrSet('data-github-badge', 'true')
      } else {
        // 普通图片链接，确保链接正常渲染
        token.attrSet('data-image-link', 'true')
      }
    }
  }

  return self.renderToken(tokens, idx, options)
}

// 添加块级数学公式的解析规则
md.block.ruler.before('fence', 'blockmath', (state, startLine, endLine, silent) => {
  const pos = state.bMarks[startLine] + state.tShift[startLine]

  // 检查是否以 $$ 开头
  if (state.src.charCodeAt(pos) !== 0x24 /* $ */ || state.src.charCodeAt(pos + 1) !== 0x24 /* $ */) {
    return false
  }

  // 查找结束的 $$
  let nextLine = startLine
  let haveEndMarker = false

  while (nextLine < endLine) {
    nextLine++
    const nextMax = state.eMarks[nextLine]

    if (state.src.charCodeAt(nextMax - 2) === 0x24 /* $ */ &&
        state.src.charCodeAt(nextMax - 1) === 0x24 /* $ */) {
      haveEndMarker = true
      break
    }
  }

  if (!haveEndMarker) {
    return false
  }

  const content = state.getLines(startLine, nextLine + 1, state.blkIndent, false)

  if (!silent) {
    const token = state.push('blockmath', '', 0)
    token.content = content
    token.map = [startLine, nextLine + 1]
  }

  state.line = nextLine + 1
  return true
})

// 配置 turndown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  bulletListMarker: '-',
})

// 首先添加数学公式规则，确保它们优先处理
// 添加 TipTap 行内数学公式规则
turndownService.addRule('tiptapInlineMath', {
  filter: function (node: HTMLElement) {
    const isInlineMath = node.nodeName === 'SPAN' && node.getAttribute('data-type') === 'inline-math'
    if (isInlineMath) {
      console.log('🔍 [tiptapInlineMath] Filter matched:', {
        nodeName: node.nodeName,
        dataType: node.getAttribute('data-type'),
        dataLatex: node.getAttribute('data-latex'),
        textContent: node.textContent
      })
    }
    return isInlineMath
  },
  replacement: function (_content: string, node: any) {
    const latex = node.getAttribute('data-latex') || node.textContent || ''
    console.log('🔄 [tiptapInlineMath] Converting to Markdown:', latex)
    return `$${latex}$`
  }
})

// 添加 TipTap 块级数学公式规则
turndownService.addRule('tiptapBlockMath', {
  filter: function (node: HTMLElement) {
    const isBlockMath = node.nodeName === 'DIV' && node.getAttribute('data-type') === 'block-math'
    if (isBlockMath) {
      console.log('🔍 [tiptapBlockMath] Filter matched:', {
        nodeName: node.nodeName,
        dataType: node.getAttribute('data-type'),
        dataLatex: node.getAttribute('data-latex'),
        textContent: node.textContent
      })
    }
    return isBlockMath
  },
  replacement: function (_content: string, node: any) {
    const latex = node.getAttribute('data-latex') || node.textContent || ''
    console.log('🔄 [tiptapBlockMath] Converting to Markdown:', latex)
    return `$$\n${latex}\n$$`
  }
})

// 添加备用数学公式规则，处理没有 data-latex 属性的情况
turndownService.addRule('fallbackInlineMath', {
  filter: function (node: HTMLElement) {
    const isInlineMath = node.nodeName === 'SPAN' && node.getAttribute('data-type') === 'inline-math'
    if (isInlineMath && (!node.getAttribute('data-latex') || node.getAttribute('data-latex') === '')) {
      console.log('🔍 [fallbackInlineMath] Found inline math without data-latex:', {
        nodeName: node.nodeName,
        dataType: node.getAttribute('data-type'),
        textContent: node.textContent,
        innerHTML: node.innerHTML
      })
      return true
    }
    return false
  },
  replacement: function (_content: string, node: any) {
    const latex = node.textContent || ''
    console.log('🔄 [fallbackInlineMath] Converting to Markdown:', latex)
    return `$${latex}$`
  }
})

// 添加备用块级数学公式规则
turndownService.addRule('fallbackBlockMath', {
  filter: function (node: HTMLElement) {
    const isBlockMath = node.nodeName === 'DIV' && node.getAttribute('data-type') === 'block-math'
    if (isBlockMath && (!node.getAttribute('data-latex') || node.getAttribute('data-latex') === '')) {
      console.log('🔍 [fallbackBlockMath] Found block math without data-latex:', {
        nodeName: node.nodeName,
        dataType: node.getAttribute('data-type'),
        textContent: node.textContent,
        innerHTML: node.innerHTML
      })
      return true
    }
    return false
  },
  replacement: function (_content: string, node: any) {
    const latex = node.textContent || ''
    console.log('🔄 [fallbackBlockMath] Converting to Markdown:', latex)
    return `$$\n${latex}\n$$`
  }
})

// 添加调试规则来检查所有数学元素
turndownService.addRule('debugMathElements', {
  filter: function (node: HTMLElement) {
    const isMathElement = node.nodeName === 'SPAN' && node.getAttribute('data-type') === 'inline-math' ||
                         node.nodeName === 'DIV' && node.getAttribute('data-type') === 'block-math'
    if (isMathElement) {
      console.log('🔍 [debugMathElements] Found math element:', {
        nodeName: node.nodeName,
        dataType: node.getAttribute('data-type'),
        dataLatex: node.getAttribute('data-latex'),
        textContent: node.textContent,
        innerHTML: node.innerHTML,
        outerHTML: node.outerHTML
      })
    }
    return false // 不处理，只用于调试
  },
  replacement: function () {
    return ''
  }
})

// 调试：检查所有已添加的规则
// console.log('🔍 [turndownSetup] All rules added:', Object.keys(turndownService.options.rules))

// 然后添加其他自定义规则来处理特殊元素
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

// 添加列表规则 - 增强网页HTML列表转换
turndownService.addRule('enhancedList', {
  filter: ['ul', 'ol'],
  replacement: function (content: string, node: any) {
    const isOrdered = node.nodeName === 'OL'

    // 使用DOM解析器更可靠地提取列表项
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content

    const listItems = Array.from(tempDiv.querySelectorAll('li'))
    if (listItems.length === 0) return content

    const markdownItems = listItems.map((item, index) => {
      const text = item.textContent?.trim() || ''
      if (isOrdered) {
        return `${index + 1}. ${text}`
      } else {
        return `- ${text}`
      }
    })

    return markdownItems.join('\n') + '\n\n'
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

// 添加行内数学公式规则
turndownService.addRule('inlineMath', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'MATH-INLINE'
  },
  replacement: function (_content: string, node: any) {
    const latex = node.getAttribute('latex') || ''
    return `$${latex}$`
  }
})

// 添加块级数学公式规则
turndownService.addRule('blockMath', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'MATH-DISPLAY'
  },
  replacement: function (_content: string, node: any) {
    const latex = node.getAttribute('latex') || ''
    return `$$\n${latex}\n$$`
  }
})

// 添加 GitHub badge 规则
turndownService.addRule('githubBadge', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'A' && node.getAttribute('data-github-badge') === 'true'
  },
  replacement: function (_content: string, node: any) {
    const href = node.getAttribute('href') || ''
    const img = node.querySelector('img')
    if (img) {
      const src = img.getAttribute('src') || ''
      const alt = img.getAttribute('alt') || ''
      return `[![${alt}](${src})](${href})`
    }
    return _content
  }
})

// 添加链接图片规则
turndownService.addRule('linkedImage', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'A' && node.querySelector('img') !== null
  },
  replacement: function (_content: string, node: any) {
    const img = node.querySelector('img')
    if (!img) return _content

    const href = node.getAttribute('href') || ''
    const src = img.getAttribute('src') || ''
    const alt = img.getAttribute('alt') || ''

    return `[![${alt}](${src})](${href})`
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
  // console.log('🔄 [markdownToHtml] Starting conversion...')
  // console.log('📄 Input Markdown:', markdown)

  const result = md.render(markdown)

  // console.log('✅ [markdownToHtml] Conversion completed')
  // console.log('📝 Output HTML:', result)

  // 检查数学公式元素
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = result
  const mathElements = tempDiv.querySelectorAll('[data-type="inline-math"], [data-type="block-math"]')
  // console.log('🔍 Math elements found in HTML:', mathElements.length)
  mathElements.forEach((el, index) => {
    console.log(`📊 Math element ${index}:`, el.outerHTML)
  })

  return result
}

// 简单的 HTML 到 Markdown 转换器（避免 turndown 的问题）
// const simpleHtmlToMarkdown = (html: string): string => {
//   let markdown = html
//
//   // 处理标题
//   markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/g, (_match, level, content) => {
//     const hashes = '#'.repeat(parseInt(level))
//     return `${hashes} ${content}\n\n`
//   })
//
//   // 处理段落
//   markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/g, (_match, content) => {
//     return `${content}\n\n`
//   })
//
//   // 处理换行
//   markdown = markdown.replace(/<br\s*\/?>/g, '\n')
//
//   // 移除其他 HTML 标签，但保留数学公式
//   markdown = markdown.replace(/<[^>]*>/g, '')
//
//   // 处理 HTML 实体
//   markdown = markdown.replace(/&amp;/g, '&')
//   markdown = markdown.replace(/&lt;/g, '<')
//   markdown = markdown.replace(/&gt;/g, '>')
//   markdown = markdown.replace(/&quot;/g, '"')
//   markdown = markdown.replace(/&#39;/g, "'")
//
//   return markdown.trim()
// }

export const htmlToMarkdown = (html: string): string => {
  console.log('🔄 [htmlToMarkdown] Starting conversion...')
  console.log('📄 Input HTML:', html)

  // 检查 turndown 服务是否有我们的规则
  // console.log('🔍 [htmlToMarkdown] Checking turndown rules...')
  // const rules = turndownService.options.rules
  // console.log('📋 Available turndown rules:', Object.keys(rules))

  // 手动处理数学公式作为备用方案
  let processedHtml = html

  // 处理行内数学公式
  processedHtml = processedHtml.replace(/<span data-latex="([^"]+)" data-type="inline-math"><\/span>/g, (_match, latex) => {
    console.log('🔄 [manualInlineMath] Converting to Markdown:', latex)
    return `$${latex}$`
  })

  // 处理块级数学公式
  processedHtml = processedHtml.replace(/<div data-latex="([^"]+)" data-type="block-math"><\/div>/g, (_match, latex) => {
    console.log('🔄 [manualBlockMath] Converting to Markdown:')
    console.log('  - Original latex:', latex)

    // 更全面的转义处理
    let unescapedLatex = latex
    // 处理 HTML 实体转义
    unescapedLatex = unescapedLatex.replace(/&amp;/g, '&')
    unescapedLatex = unescapedLatex.replace(/&lt;/g, '<')
    unescapedLatex = unescapedLatex.replace(/&gt;/g, '>')
    unescapedLatex = unescapedLatex.replace(/&quot;/g, '"')
    unescapedLatex = unescapedLatex.replace(/&#39;/g, "'")
    // 注意：不要处理双反斜杠，因为 LaTeX 需要 \\ 来表示换行

    console.log('  - After unescaping:', unescapedLatex)
    // 返回块级公式格式
    return `$$\n${unescapedLatex}\n$$`
  })

  console.log('🔄 [htmlToMarkdown] After manual processing:')
  console.log('📄 Processed HTML:', processedHtml)

  // 直接返回手动处理的结果，跳过 HTML 清理
  // 因为我们已经手动处理了所有数学公式
  const result = processedHtml
    // 移除尾部空白元素（只移除包含 ProseMirror-trailingBreak 的段落）
    .replace(/<p><br><br class="ProseMirror-trailingBreak"><\/p>/g, '')
    .replace(/<p><br class="ProseMirror-trailingBreak"><\/p>/g, '')
    // 保留普通的空段落 <p><br></p>，它们表示用户创建的空行
    // 移除组件之间的尾部空白
    .replace(/<\/div><p><br><br class="ProseMirror-trailingBreak"><\/p><div/g, '</div><div')
    // 处理图片链接之间的 br 标签 - 完全移除
    .replace(/<a[^>]*data-github-badge[^>]*>.*?<\/a>\s*<br>\s*<a[^>]*data-github-badge[^>]*>/g, (match) => {
      return match.replace(/<br>/g, '')
    })
    .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/g, (_match, level, content) => {
      const hashes = '#'.repeat(parseInt(level))
      return `${hashes} ${content}\n\n`
    })
    .replace(/<p[^>]*>(.*?)<\/p>/g, (_match, content) => {
      return `${content}\n\n`
    })
    // 保留有用的 HTML 标签（div、span 等）
    .replace(/<(\/?(span|center|font|table|tr|td|th|thead|tbody|tfoot))[^>]*>/gi, '') // 移除这些标签但保留内容
    // 保留 div 标签及其属性
    .replace(/<div[^>]*>(.*?)<\/div>/g, (_match, content) => {
      // 提取 div 的属性
      const alignMatch = _match.match(/align="([^"]*)"/)
      if (alignMatch) {
        return `<div align="${alignMatch[1]}">${content}<\/div>`
      }
      return `<div>${content}<\/div>`
    })
    // 移除剩余的 HTML 标签，但保留 div 标签
    .replace(/<(?!\/?div)[^>]*>/g, '')

  console.log('✅ [htmlToMarkdown] Conversion completed')
  console.log('📝 Output Markdown:', result)

  // 检查块级公式格式
  const blockMathMatches = result.match(/\$\$[\s\S]*?\$\$/g)
  if (blockMathMatches) {
    console.log('🔍 Block math formulas found:', blockMathMatches.length)
    blockMathMatches.forEach((math, index) => {
      console.log(`📊 Block math ${index}:`, math)
    })
  }

  return result
}