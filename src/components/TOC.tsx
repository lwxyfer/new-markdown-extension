import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { List, ChevronRight } from 'lucide-react'

interface TOCProps {
  editor: Editor | null
  tocItems: any[]
  onToggle?: (isCollapsed: boolean) => void
}

const TOC: React.FC<TOCProps> = ({ editor, tocItems, onToggle }) => {
  // 有标题数据时默认展开，无标题时默认折叠
  const [isCollapsed, setIsCollapsed] = useState(tocItems.length === 0)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  // 监听标题数据变化，当从无标题变为有标题时自动展开
  useEffect(() => {
    if (tocItems.length > 0 && isCollapsed) {
      setIsCollapsed(false)
      onToggle?.(false)
    }
  }, [tocItems.length, isCollapsed, onToggle])

  useEffect(() => {
    if (!editor || tocItems.length === 0) return

    const handleScroll = () => {
      const editorElement = document.querySelector('.editor-content')
      if (!editorElement) return

      const scrollTop = editorElement.scrollTop
      let activeId: string | null = null
      let minDistance = Infinity

      tocItems.forEach(item => {
        const headingElement = document.getElementById(item.id)
        if (headingElement) {
          const elementTop = headingElement.offsetTop
          const distance = Math.abs(elementTop - scrollTop - 50) // 100px 偏移量

          if (distance < minDistance) {
            minDistance = distance
            activeId = item.id
          }
        }
      })

      if (activeId) {
        setActiveItemId(activeId)
      }
    }

    const editorElement = document.querySelector('.editor-content')
    if (editorElement) {
      editorElement.addEventListener('scroll', handleScroll)
      // 初始触发一次
      handleScroll()
    }

    return () => {
      const editorElement = document.querySelector('.editor-content')
      if (editorElement) {
        editorElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [editor, tocItems])

  if (!editor) {
    return null
  }

  const handleItemClick = (item: any) => {
    // TableOfContents 扩展会自动为标题元素设置 ID
    // 我们可以直接使用 item.id 来查找对应的标题元素
    const element = document.getElementById(item.id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })

      // 添加高亮效果
      element.classList.add('toc-highlight')
      setTimeout(() => {
        element.classList.remove('toc-highlight')
      }, 2000)
    }
  }

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    onToggle?.(newCollapsedState)
  }

  // 如果 TOC 为空且折叠，仍然显示悬浮按钮

  return (
    <>
      {/* 悬浮按钮 - 始终显示 */}
      <button
        className="toc-toggle-btn"
        onClick={toggleCollapse}
        title={isCollapsed ? "展开目录" : "折叠目录"}
        style={{ display: isCollapsed ? 'block' : 'none' }}
      >
        <List size={16} />
      </button>

      {/* TOC 容器 - 根据折叠状态显示/隐藏 */}
      {!isCollapsed && (
        <div className="toc-container">
          {/* 折叠按钮 */}
          <button
            className="toc-collapse-btn"
            onClick={toggleCollapse}
            title="折叠目录"
          >
            <ChevronRight size={16} />
          </button>

          <div className="toc-content">
            {tocItems.length === 0 ? (
              <div className="toc-empty">暂无标题</div>
            ) : (
              <ul className="toc-list">
                {tocItems.map((item) => (
                  <li
                    key={item.id}
                    className={`toc-item toc-level-${item.level} ${activeItemId === item.id ? 'toc-item-active' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className="toc-item-text">{item.textContent}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default TOC