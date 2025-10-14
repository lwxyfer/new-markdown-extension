import React, { useEffect, useRef, useState } from 'react'

interface MermaidFullscreenProps {
  content: string
  isOpen: boolean
  onClose: () => void
}

const MermaidFullscreen: React.FC<MermaidFullscreenProps> = ({
  content,
  isOpen,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // 渲染 Mermaid 图表
  useEffect(() => {
    let isMounted = true

    const renderMermaid = async () => {
      if (!diagramRef.current || !content || !isOpen) {
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
        const id = `mermaid-fullscreen-${Math.random().toString(36).substr(2, 9)}`

        // Use render method to generate SVG without DOM manipulation
        const { svg } = await mermaid.render(id, content)

        // Only update if component is still mounted
        if (isMounted && diagramRef.current) {
          // Create and append the SVG directly
          const svgContainer = document.createElement('div')
          svgContainer.className = 'mermaid-fullscreen-diagram'
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
  }, [content, isOpen])

  // 鼠标拖拽事件
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

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

  // 缩放控制
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.1))
  }

  const resetView = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // 使用 ref 添加非被动事件监听器
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const handleTouchStartNonPassive = (e: TouchEvent) => {
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
        ;(e.target as any).initialScale = scale
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
          const newScale = Math.max(0.1, Math.min(3, initialScale * (distance / initialDistance)))
          setScale(newScale)
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
    element.addEventListener('touchstart', handleTouchStartNonPassive, { passive: false })
    element.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStartNonPassive)
      element.removeEventListener('touchmove', handleTouchMoveNonPassive)
    }
  }, [scale, position, isDragging, dragStart])

  // ESC键退出
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="mermaid-fullscreen-overlay">
      <div className="mermaid-fullscreen-controls">
        <button
          className="mermaid-fullscreen-close"
          onClick={onClose}
          title="Close (ESC)"
        >
          ✕
        </button>
        <div className="mermaid-fullscreen-zoom-controls">
          <button onClick={zoomOut} title="Zoom out">-</button>
          <button onClick={resetView} title="Reset view">
            {Math.round(scale * 100)}%
          </button>
          <button onClick={zoomIn} title="Zoom in">+</button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="mermaid-fullscreen-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {isLoading && (
          <div className="mermaid-fullscreen-loading">
            Rendering diagram...
          </div>
        )}

        {error && (
          <div className="mermaid-fullscreen-error">
            {error}
          </div>
        )}

        <div
          ref={diagramRef}
          className="mermaid-fullscreen-content"
        />
      </div>
    </div>
  )
}

export default MermaidFullscreen