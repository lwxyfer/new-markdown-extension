import MarkdownIt from 'markdown-it'
import TurndownService from 'turndown'

// Configure markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

// Save original fence rendering rule
const originalFence = md.renderer.rules.fence

// Custom fence rendering rule to support Mermaid
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const info = token.info.trim()

  // If it's a mermaid code block, render as special div
  if (info === 'mermaid') {
    const content = token.content
    return `<div data-type="mermaid" data-content="${md.utils.escapeHtml(content)}"></div>`
  }

  // For other code blocks, use original rendering rule
  return originalFence!(tokens, idx, options, env, self)
}

// Save original inline rendering rule
const originalInline = md.renderer.rules.inline

// 自定义 inline 渲染规则以支持数学公式
md.renderer.rules.inline = (tokens, idx, options, env, self) => {
  const token = tokens[idx]

  // Check if it's a math formula
  if (token.content.startsWith('$') && token.content.endsWith('$') && token.content.length > 2) {
    const latex = token.content.slice(1, -1)
    // Generate TipTap-compatible inline math formula element
    return `<span data-latex="${md.utils.escapeHtml(latex)}" data-type="inline-math"></span>`
  }

  // For other inline elements, use original rendering rule
  return originalInline!(tokens, idx, options, env, self)
}

// Add rendering rule for block math formula
md.renderer.rules.blockmath = (tokens, idx) => {
  const token = tokens[idx]
  const content = token.content.trim()

  // Remove $$ and whitespace from front and back
  const latex = content.replace(/^\$\$\s*|\s*\$\$$/g, '')
  // Generate TipTap-compatible block math formula element
  return `<div data-latex="${md.utils.escapeHtml(latex)}" data-type="block-math"></div>`
}

// Add GitHub badge custom rendering rule
md.renderer.rules.image = (tokens, idx, options, _env, self) => {
  const token = tokens[idx]
  const src = token.attrGet('src') || ''
  const alt = token.attrGet('alt') || ''

  // Check if it's a badge image
  const isBadge = src.includes('shields.io') ||
                  src.includes('badge.fury.io') ||
                  src.includes('badges.gitter') ||
                  src.includes('badgen.net')

  if (isBadge) {
    return `<img src="${src}" alt="${alt}" data-badge="true" />`
  }

  return self.renderToken(tokens, idx, options)
}

// Add image link rendering rule
md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
  const token = tokens[idx]

  // Check if link contains image
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
        // Normal image link, ensure link renders correctly
        token.attrSet('data-image-link', 'true')
      }
    }
  }

  return self.renderToken(tokens, idx, options)
}

// Add parsing rule for block math formula
md.block.ruler.before('fence', 'blockmath', (state, startLine, endLine, silent) => {
  const pos = state.bMarks[startLine] + state.tShift[startLine]

  // Check if starts with $$
  if (state.src.charCodeAt(pos) !== 0x24 /* $ */ || state.src.charCodeAt(pos + 1) !== 0x24 /* $ */) {
    return false
  }

  // Find closing $$
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

// Configure turndown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  bulletListMarker: '-',
})

// Add math formula rule first, ensure they are processed with priority
// Add TipTap inline math formula rule
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

// Add TipTap block math formula rule
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

// Add fallback math formula rule to handle cases without data-latex attribute
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

// Add fallback block math formula rule
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

// Add debug rule to check all math elements
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
    return false // Don't process, only for debugging
  },
  replacement: function () {
    return ''
  }
})

// Debug: Check all added rules
// console.log('🔍 [turndownSetup] All rules added:', Object.keys(turndownService.options.rules))

// Then add other custom rules to handle special elements
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

// Add table rule
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

// Add list rule - Enhanced HTML list to conversion
turndownService.addRule('enhancedList', {
  filter: ['ul', 'ol'],
  replacement: function (content: string, node: any) {
    const isOrdered = node.nodeName === 'OL'

    // Use DOM parser to more reliably extract list items
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

// Add Mermaid rule
turndownService.addRule('mermaid', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'DIV' && node.getAttribute('data-type') === 'mermaid'
  },
  replacement: function (_content: string, node: any) {
    const mermaidContent = node.getAttribute('data-content') || ''
    return `\`\`\`mermaid\n${mermaidContent}\n\`\`\`\n`
  }
})

// Add inline math formula rule
turndownService.addRule('inlineMath', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'MATH-INLINE'
  },
  replacement: function (_content: string, node: any) {
    const latex = node.getAttribute('latex') || ''
    return `$${latex}$`
  }
})

// Add block math formula rule
turndownService.addRule('blockMath', {
  filter: function (node: HTMLElement) {
    return node.nodeName === 'MATH-DISPLAY'
  },
  replacement: function (_content: string, node: any) {
    const latex = node.getAttribute('latex') || ''
    return `$$\n${latex}\n$$`
  }
})

// Add GitHub badge rule
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

// Add linked image rule
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

// Add code block rule
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


// Export utility functions
export const markdownToHtml = (markdown: string): string => {
  // console.log('🔄 [markdownToHtml] Starting conversion...')
  // console.log('📄 Input Markdown:', markdown)

  const result = md.render(markdown)

  // console.log('✅ [markdownToHtml] Conversion completed')
  // console.log('📝 Output HTML:', result)

  // Check for math formula elements
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = result
  const mathElements = tempDiv.querySelectorAll('[data-type="inline-math"], [data-type="block-math"]')
  // console.log('🔍 Math elements found in HTML:', mathElements.length)
  mathElements.forEach((el, index) => {
    console.log(`📊 Math element ${index}:`, el.outerHTML)
  })

  return result
}

// Simple HTML to Markdown converter (avoid turndown issues)
// const simpleHtmlToMarkdown = (html: string): string => {
//   let markdown = html
//
//   // Handle headings
//   markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/g, (_match, level, content) => {
//     const hashes = '#'.repeat(parseInt(level))
//     return `${hashes} ${content}\n\n`
//   })
//
//   // Handle paragraphs
//   markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/g, (_match, content) => {
//     return `${content}\n\n`
//   })
//
//   // Handle line breaks
//   markdown = markdown.replace(/<br\s*\/?>/g, '\n')
//
//   // Remove other HTML tags but preserve math formulas
//   markdown = markdown.replace(/<[^>]*>/g, '')
//
//   // Handle HTML entities
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
    // 移除尾部空白元素
    .replace(/<p><br><br class="ProseMirror-trailingBreak"><\/p>/g, '')
    .replace(/<p><br class="ProseMirror-trailingBreak"><\/p>/g, '')
    .replace(/<p[^>]*><br[^>]*><\/p>/g, '')
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