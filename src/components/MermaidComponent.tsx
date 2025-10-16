import React, { useEffect, useRef, useState } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import MermaidFullscreen from './MermaidFullscreen'

const MermaidComponent: React.FC<any> = ({ node, updateAttributes }) => {
  const diagramRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(node.attrs.content || node.textContent)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const content = node.attrs.content || node.textContent

  // 切换编辑模式
  const toggleEditMode = () => {
    if (isEditing) {
      // 保存更改 - 更新属性
      updateAttributes({ content: editContent })
    } else {
      // 进入编辑模式，设置编辑内容
      setEditContent(content)
    }
    setIsEditing(!isEditing)
  }

  // 缩放控制
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2))
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }

  // 全屏预览
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // 关闭全屏
  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  // 鼠标拖拽事件
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isEditing) return

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // 使用 ref 添加非被动事件监听器
  useEffect(() => {
    const element = diagramRef.current
    if (!element) return

    const handleWheelNonPassive = (e: WheelEvent) => {
      if (isEditing) return

      // 阻止页面缩放
      e.preventDefault()

      // 检测是否是触控板事件（deltaY 较小）
      const isTrackpad = Math.abs(e.deltaY) < 100

      if (isTrackpad) {
        // 触控板缩放
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
        setZoomLevel(prev => Math.max(0.5, Math.min(2, prev * zoomFactor)))
      }
    }

    const handleTouchStartNonPassive = (e: TouchEvent) => {
      if (isEditing) return

      if (e.touches.length === 2) {
        // 双指开始缩放 - 阻止默认行为
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        ;(e.target as any).initialDistance = distance
        ;(e.target as any).initialScale = zoomLevel
      } else if (e.touches.length === 1) {
        // 单指开始拖拽
        setIsDragging(true)
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        })
      }
    }

    const handleTouchMoveNonPassive = (e: TouchEvent) => {
      if (isEditing) return

      if (e.touches.length === 2) {
        // 双指缩放 - 阻止默认行为
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )

        const initialDistance = (e.target as any).initialDistance
        const initialScale = (e.target as any).initialScale

        if (initialDistance) {
          const newScale = Math.max(0.5, Math.min(2, initialScale * (distance / initialDistance)))
          setZoomLevel(newScale)
        }
      } else if (e.touches.length === 1 && isDragging) {
        // 单指拖拽
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y
        })
      }
    }

    // 添加非被动事件监听器
    element.addEventListener('wheel', handleWheelNonPassive, { passive: false })
    element.addEventListener('touchstart', handleTouchStartNonPassive, { passive: false })
    element.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false })

    return () => {
      element.removeEventListener('wheel', handleWheelNonPassive)
      element.removeEventListener('touchstart', handleTouchStartNonPassive)
      element.removeEventListener('touchmove', handleTouchMoveNonPassive)
    }
  }, [isEditing, zoomLevel, position, isDragging, dragStart])


  // 渲染 Mermaid 图表
  useEffect(() => {
    let isMounted = true

    const renderMermaid = async () => {
      if (!diagramRef.current || !content || isEditing) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Dynamically import mermaid from local package
        const mermaidModule = await import('mermaid')
        const mermaid = mermaidModule.default

        // 检测 VSCode 主题并设置相应的 Mermaid 主题
        const isDarkTheme = document.body.classList.contains('vscode-dark') ||
                           document.body.classList.contains('vscode-high-contrast')
        const mermaidTheme = isDarkTheme ? 'dark' : 'default'

        // Initialize mermaid with theme configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: mermaidTheme,
          securityLevel: 'loose',
          fontFamily: 'inherit',
        })

        // Clear previous content
        diagramRef.current.innerHTML = ''

        // Create a unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Use render method to generate SVG without DOM manipulation
        const { svg } = await mermaid.render(id, content)

        // Only update if component is still mounted
        if (isMounted && diagramRef.current) {
          // Create and append the SVG directly
          const svgContainer = document.createElement('div')
          svgContainer.className = 'mermaid-diagram'
          svgContainer.innerHTML = svg

          diagramRef.current.appendChild(svgContainer)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Mermaid rendering error:', err)
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          setError('Failed to render diagram: ' + errorMessage)
          setIsLoading(false)
        }
      }
    }

    renderMermaid()

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false
    }
  }, [content, isEditing])

  // 自动调整文本框高度
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }, [isEditing, editContent])

  // 应用缩放和位置效果
  useEffect(() => {
    if (!isEditing && diagramRef.current) {
      const svg = diagramRef.current.querySelector('svg')
      if (svg) {
        svg.style.transform = `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`
        svg.style.transformOrigin = 'center'
      }
    }
  }, [zoomLevel, position, isEditing])


  return (
    <NodeViewWrapper className="mermaid-diagram-wrapper">
      <div className="mermaid-diagram-container">
        <div className="mermaid-header">
          <span className="mermaid-label">Mermaid Diagram</span>
          <div className="mermaid-actions">
            {!isEditing && (
              <>
                <button
                  type="button"
                  className="mermaid-zoom-btn"
                  onClick={zoomOut}
                  title="Zoom out"
                  disabled={zoomLevel <= 0.5}
                >
                  -
                </button>
                <button
                  type="button"
                  className="mermaid-zoom-btn"
                  onClick={resetZoom}
                  title="Reset zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  className="mermaid-zoom-btn"
                  onClick={zoomIn}
                  title="Zoom in"
                  disabled={zoomLevel >= 2}
                >
                  +
                </button>
                <button
                  type="button"
                  className="mermaid-fullscreen-btn"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
                >
                  {isFullscreen ? '⛶' : '⛶'}
                </button>
              </>
            )}
            <button
              type="button"
              className="mermaid-toggle-btn"
              onClick={toggleEditMode}
              title={isEditing ? 'Preview diagram' : 'Edit code'}
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
          </div>
        </div>

        {isEditing ? (
          // 编辑模式：显示代码编辑器
          <div className="mermaid-editor">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="mermaid-code-editor"
              placeholder="Enter your Mermaid diagram code here..."
            />
          </div>
        ) : (
          // 预览模式：显示图表
          <>
            {isLoading && (
              <div className="mermaid-loading">
                Rendering diagram...
              </div>
            )}

            {error && (
              <div className="mermaid-error">
                {error}
              </div>
            )}

            <div
              ref={diagramRef}
              className="mermaid-content"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchEnd={handleTouchEnd}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            />
          </>
        )}

        <NodeViewContent
          as="div"
          className="mermaid-source"
          style={{
            display: 'none'
          }}
        />
      </div>

      <MermaidFullscreen
        content={content}
        isOpen={isFullscreen}
        onClose={closeFullscreen}
      />
    </NodeViewWrapper>
  )
}

export default MermaidComponent