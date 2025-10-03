import React, { useEffect, useRef, useState } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

const MermaidComponent: React.FC<any> = ({ node, updateAttributes, editor }) => {
  const diagramRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(node.textContent)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const content = node.textContent

  // 切换编辑模式
  const toggleEditMode = () => {
    if (isEditing) {
      // 保存更改
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
  }

  // 全屏预览
  const toggleFullscreen = () => {
    if (!diagramRef.current) return

    if (!isFullscreen) {
      // 进入全屏
      const element = diagramRef.current
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen()
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

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

        // Initialize mermaid with default configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
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

  // 应用缩放效果
  useEffect(() => {
    if (!isEditing && diagramRef.current) {
      const svg = diagramRef.current.querySelector('svg')
      if (svg) {
        svg.style.transform = `scale(${zoomLevel})`
        svg.style.transformOrigin = 'center'
      }
    }
  }, [zoomLevel, isEditing])

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

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
    </NodeViewWrapper>
  )
}

export default MermaidComponent