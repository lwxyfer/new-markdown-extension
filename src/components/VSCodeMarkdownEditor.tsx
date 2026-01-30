import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { Link } from '@tiptap/extension-link'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { TableOfContents } from '@tiptap/extension-table-of-contents'
import { SlashCommand } from './SlashCommand'
import MenuBar from './MenuBar'
import TOC from './TOC'
import SearchBox from './SearchBox'
import { markdownToHtml, htmlToMarkdown } from '../utils/markdownUtils'
import { MermaidExtension } from '../extensions/MermaidExtension'
import { CodeBlockExtension } from '../extensions/CodeBlockExtension'
import BubbleMenuExtension from '../extensions/BubbleMenuExtension'
import { LinkedImageExtension } from '../extensions/LinkedImageExtension'
import { MathematicsExtension } from '../extensions/MathematicsExtension'
import { SearchHighlightExtension } from '../extensions/SearchHighlightExtension'
import { KeyboardShortcutsExtension } from '../extensions/KeyboardShortcutsExtension'
import { ParagraphBehaviorExtension } from '../extensions/ParagraphBehaviorExtension'
import { migrateMathStrings } from '@tiptap/extension-mathematics'
import { isReadyMessage } from '../core/messageTypes'

// 声明全局的 vscode API
declare global {
  const vscode: {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
  };
}

interface VSCodeMarkdownEditorProps {
  initialContent: string;
}

const VSCodeMarkdownEditor: React.FC<VSCodeMarkdownEditorProps> = ({ initialContent }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isTocCollapsed, setIsTocCollapsed] = useState(true)
  const [tocItems, setTocItems] = useState<any[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ start: number; end: number }>>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const isInitializingRef = useRef(true)

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        paragraph: false, // 禁用默认 paragraph，使用自定义的
        heading: {
          HTMLAttributes: {
            class: 'heading',
          },
        },
        hardBreak: {
          keepMarks: false,
          HTMLAttributes: {
            class: 'hard-break',
          },
        },
      }),
      ParagraphBehaviorExtension,
      KeyboardShortcutsExtension,
      CodeBlockExtension,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      LinkedImageExtension,
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: '使用 / 触发命令',
      }),
      Gapcursor,
      MermaidExtension,
      MathematicsExtension,
      SlashCommand,
      TableOfContents.configure({
        onUpdate: (content) => {
          setTocItems(content)
        },
      }),
      SearchHighlightExtension.configure({
        searchQuery: searchQuery,
        currentMatchIndex: currentMatchIndex,
        searchResults: searchResults,
      }),
    ],
    content: markdownToHtml(initialContent),
    onUpdate: ({ editor }) => {
      console.log('🔧 Editor onUpdate triggered')

      // 跳过初始化时的更新
      if (isInitializingRef.current) {
        console.log('⏭️ Skipping initial update')
        return
      }

      // 获取编辑器 HTML 内容
      const htmlContent = editor.getHTML()
      console.log('📄 === Editor HTML content ===')
      console.log(htmlContent)

      // 详细检查数学公式元素
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent

      // 检查所有可能的数学公式元素
      const mathElements = tempDiv.querySelectorAll('[data-type*="math"], math-inline, math-display')
      console.log('🔍 Found math elements:', mathElements.length)

      // 详细检查每个元素
      mathElements.forEach((el, index) => {
        console.log(`📊 Math element ${index}:`)
        console.log('  - Outer HTML:', el.outerHTML)
        console.log('  - Node name:', el.nodeName)
        console.log('  - Data type:', el.getAttribute('data-type'))
        console.log('  - Data latex:', el.getAttribute('data-latex'))
        console.log('  - Text content:', el.textContent)
        console.log('  - All attributes:')
        Array.from(el.attributes).forEach(attr => {
          console.log(`    ${attr.name}: ${attr.value}`)
        })
      })

      // 检查转换过程
      console.log('🔄 Starting HTML to Markdown conversion...')
      const markdownContent = htmlToMarkdown(htmlContent)
      console.log('✅ === Converted Markdown content ===')
      console.log(markdownContent)

      // 检查转换后的数学公式
      const mathInMarkdown = markdownContent.match(/\$[^$]+\$|\$\$[\s\S]*?\$\$/g)
      console.log('🔍 Math formulas found in Markdown:', mathInMarkdown?.length || 0)
      if (mathInMarkdown) {
        mathInMarkdown.forEach((math, index) => {
          console.log(`📊 Math formula ${index}:`, math)
        })
      }

      sendEdit(markdownContent)

      // 保存状态到 VSCode
      vscode.setState({ content: markdownContent })
    },
    onCreate: ({ editor: currentEditor }) => {
      setIsLoading(false)

      // 迁移旧的数学字符串格式
      migrateMathStrings(currentEditor)

      // 初始化完成，允许后续的更新
      isInitializingRef.current = false

      // 通知 VSCode webview 已准备就绪
      vscode.postMessage({
        type: 'ready'
      })

      // 恢复之前的状态
      const savedState = vscode.getState()
      if (savedState?.content) {
        console.log('Restoring saved state')
        const htmlContent = markdownToHtml(savedState.content)
        editor?.commands.setContent(htmlContent)
      }
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        // 智能粘贴处理：支持三种主要场景

        // 1. 优先检查HTML格式
        const html = clipboardData.getData('text/html')
        if (html) {
          // 场景1：检测是否为TipTap编辑器复制的内容
          const isTipTapContent = html.includes('data-type="inline-math"') ||
                                 html.includes('data-type="block-math"') ||
                                 html.includes('data-type="mermaid"') ||
                                 html.includes('data-type="taskList"') ||
                                 html.includes('data-type="taskItem"') ||
                                 // 检测TipTap特有的HTML结构
                                 html.includes('class="ProseMirror"') ||
                                 html.includes('data-tiptap-node') ||
                                 // 检测TipTap常规格式
                                 html.includes('data-type="image"') ||
                                 html.includes('class="code-block"') ||
                                 html.includes('class="heading"') ||
                                 // 检测列表格式 - 更精确的检测
                                 html.includes('data-type="bulletList"') ||
                                 html.includes('data-type="orderedList"') ||
                                 html.includes('role="list"') ||
                                 html.includes('<ul ') ||
                                 html.includes('<ol ')

          if (isTipTapContent) {
            console.log('🔍 [Paste] 场景1：TipTap编辑器内容，直接插入')
            event.preventDefault()

            // 直接插入HTML内容，保持格式完整性
            const { state, dispatch } = view
            const { from } = state.selection

            // 清除当前选区
            const clearTr = state.tr.delete(from, from)
            dispatch(clearTr)

            // 直接插入HTML内容
            editor?.commands.insertContent(html)
            return true
          }

          // 场景2：网页HTML内容，转换为Markdown
          console.log('🔍 [Paste] 场景2：网页HTML内容，转换为Markdown')
          event.preventDefault()

          // 使用turndown转换HTML为Markdown
          const markdownContent = htmlToMarkdown(html)
          const convertedHtml = markdownToHtml(markdownContent)

          // 插入转换后的内容
          const { state, dispatch } = view
          const { from } = state.selection

          // 清除当前选区
          const clearTr = state.tr.delete(from, from)
          dispatch(clearTr)

          // 插入转换后的HTML
          editor?.commands.insertContent(convertedHtml)
          return true
        }

        // 2. 检查图片粘贴
        const files = Array.from(clipboardData.files)
        const imageFiles = files.filter(file => file.type.startsWith('image/'))

        if (imageFiles.length > 0) {
          console.log('🔍 [Paste] 检测到图片文件，处理中...')
          event.preventDefault()

          // 处理图片文件
          for (const imageFile of imageFiles) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string
              if (dataUrl) {
                // 插入图片到编辑器
                editor?.commands.setImage({ src: dataUrl })
              }
            }
            reader.readAsDataURL(imageFile)
          }
          return true
        }

        // 3. 检查纯文本格式
        const text = clipboardData.getData('text/plain')

        // 场景3：检测是否为Markdown语法内容
        const isMarkdownContent = /^#+\s|\*\*.*\*\*|__.*__|\[.*\]\(.*\)|\`.*\`|\$\$.*\$\$|^\s*[-*+]\s|^\s*\d+\.\s|^```[\w]*\s*\n|^\s*-\s|^\s*\*\s|^\s*\+\s/.test(text)

        if (isMarkdownContent) {
          console.log('🔍 [Paste] 场景3：Markdown语法内容，解析为HTML')
          event.preventDefault()

          // 转换Markdown为HTML
          const htmlContent = markdownToHtml(text)

          // 插入转换后的内容
          const { state, dispatch } = view
          const { from } = state.selection

          // 清除当前选区
          const clearTr = state.tr.delete(from, from)
          dispatch(clearTr)

          // 插入HTML内容
          editor?.commands.insertContent(htmlContent)
          return true
        }

        // 4. 兜底：纯文本插入
        console.log('🔍 [Paste] 场景4：纯文本内容，直接插入')
        event.preventDefault()

        // 直接插入纯文本
        const { state, dispatch } = view
        const { from } = state.selection

        // 清除当前选区
        const clearTr = state.tr.delete(from, from)
        dispatch(clearTr)

        // 插入纯文本
        editor?.commands.insertContent(text)
        return true
      },
    },
  })

  // 监听来自 VSCode 的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data

      if (isReadyMessage(message)) {
        // 处理 ready 消息
        console.log('Webview ready message received')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 监听键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setIsSearchOpen(true)
      }

      // ESC 关闭搜索
      if (e.key === 'Escape' && isSearchOpen) {
        e.preventDefault()
        setIsSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
        setCurrentMatchIndex(0)
      }

      // F3 下一个匹配项
      if (e.key === 'F3' && isSearchOpen) {
        e.preventDefault()
        if (searchResults.length > 0) {
          const newIndex = (currentMatchIndex + 1) % searchResults.length
          setCurrentMatchIndex(newIndex)
          const match = searchResults[newIndex]
          if (editor && match) {
            editor.commands.setTextSelection({
              from: match.start,
              to: match.end
            })
            setTimeout(() => {
              // 方法1: 使用TipTap的视图滚动
              const view = editor.view
              if (view && view.dom) {
                const coords = view.coordsAtPos(match.start)
                if (coords) {
                  const editorElement = view.dom.closest('.editor-content')
                  if (editorElement) {
                    const targetY = coords.top - editorElement.getBoundingClientRect().top + editorElement.scrollTop - 100
                    editorElement.scrollTo({
                      top: targetY,
                      behavior: 'smooth'
                    })
                  }
                }
              }

              // 方法2: 备用方案 - 使用DOM选择器
              const editorElement = document.querySelector('.editor-content')
              if (editorElement) {
                const selection = window.getSelection()
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0)
                  const element = range.startContainer.parentElement
                  if (element) {
                    element.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    })
                  }
                }
              }
            }, 100)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, searchResults, currentMatchIndex, editor])

  // 发送编辑内容到 VSCode
  const sendEdit = useCallback((content: string) => {
    vscode.postMessage({
      type: 'edit',
      content: content
    })
  }, [])

  // 搜索功能
  const performSearch = useCallback((query: string) => {
    if (!editor || !query.trim()) {
      setSearchResults([])
      setCurrentMatchIndex(0)

      // 清除高亮
      if (editor) {
        editor.commands.updateSearchHighlight({
          searchQuery: '',
          currentMatchIndex: -1,
          searchResults: []
        })
      }
      return
    }

    // 使用 TipTap 的文档搜索方法，避免位置偏移问题
    const matches: Array<{ start: number; end: number }> = []
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escapedQuery, 'gi')

    // 遍历文档的所有文本节点
    editor.state.doc.descendants((node, pos) => {
      if (node.isText) {
        const text = node.text || ''
        let match

        while ((match = regex.exec(text)) !== null) {
          const start = pos + match.index
          const end = start + match[0].length

          matches.push({
            start: start,
            end: end
          })

        }
      }
    })

    setSearchResults(matches)
    setCurrentMatchIndex(matches.length > 0 ? 0 : -1)

    // 更新高亮
    if (editor) {
      editor.commands.updateSearchHighlight({
        searchQuery: query,
        currentMatchIndex: matches.length > 0 ? 0 : -1,
        searchResults: matches
      })
    }
  }, [editor])

  // 导航到匹配项
  const navigateToMatch = useCallback((direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return

    let newIndex
    if (direction === 'next') {
      newIndex = (currentMatchIndex + 1) % searchResults.length
    } else {
      newIndex = (currentMatchIndex - 1 + searchResults.length) % searchResults.length
    }

    setCurrentMatchIndex(newIndex)

    // 更新当前匹配项的高亮
    if (editor) {
      editor.commands.updateSearchHighlight({
        searchQuery: searchQuery,
        currentMatchIndex: newIndex,
        searchResults: searchResults
      })
    }

    // 滚动到匹配项
    const match = searchResults[newIndex]
    if (editor && match) {
      // 设置选区并滚动到视图
      editor.commands.setTextSelection({
        from: match.start,
        to: match.end
      })

      // 确保编辑器滚动到选区位置
      setTimeout(() => {
        // 方法1: 使用TipTap的视图滚动
        const view = editor.view
        if (view && view.dom) {
          const coords = view.coordsAtPos(match.start)
          if (coords) {
            const editorElement = view.dom.closest('.editor-content')
            if (editorElement) {
              const targetY = coords.top - editorElement.getBoundingClientRect().top + editorElement.scrollTop - 100
              editorElement.scrollTo({
                top: targetY,
                behavior: 'smooth'
              })
            }
          }
        }

        // 方法2: 备用方案 - 使用DOM选择器
        const editorElement = document.querySelector('.editor-content')
        if (editorElement) {
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const element = range.startContainer.parentElement
            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              })
            }
          }
        }
      }, 100)
    }
  }, [searchResults, currentMatchIndex, editor])

  // 处理搜索查询变化
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    performSearch(query)
  }, [performSearch])

  // 处理搜索导航
  const handleNavigate = useCallback((direction: 'next' | 'prev') => {
    navigateToMatch(direction)
  }, [navigateToMatch])

  // 关闭搜索
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
    setCurrentMatchIndex(0)
  }, [])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: '#666'
      }}>
        编辑器加载中...
      </div>
    )
  }

  return (
    <div className="vscode-markdown-editor">
      <MenuBar editor={editor} />
      <div className="editor-container">
        <TOC
          editor={editor}
          tocItems={tocItems}
          onToggle={(collapsed) => setIsTocCollapsed(collapsed)}
        />
        <div className={`editor-content ${isTocCollapsed ? 'no-toc' : ''}`}>
          <EditorContent editor={editor} />
          <BubbleMenuExtension editor={editor} />
        </div>
      </div>

      <SearchBox
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        currentMatch={currentMatchIndex + 1}
        totalMatches={searchResults.length}
      />
    </div>
  )
}

export default VSCodeMarkdownEditor