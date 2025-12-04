import React, { useState, useEffect, useRef } from 'react'
import { ReactNodeViewProps, NodeViewWrapper } from '@tiptap/react'

// Use global vscode API, declared in other files

// Global cache to avoid repeated conversions
const imageUrlCache = new Map<string, string>()

const LocalImage: React.FC<ReactNodeViewProps> = ({ node }) => {
  const src = node.attrs.src
  const alt = node.attrs.alt || 'Image'
  const title = node.attrs.title || ''

  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    // Avoid duplicate processing
    if (hasProcessedRef.current) {
      return
    }
    hasProcessedRef.current = true

    const processImageSrc = async () => {
      console.log('🖼️ Processing image source:', src)

      // Check cache
      if (imageUrlCache.has(src)) {
        console.log('🖼️ Using cached URL:', imageUrlCache.get(src))
        setImageUrl(imageUrlCache.get(src)!)
        setIsLoading(false)
        return
      }

      // If it's a data URL or network URL, use directly
      if (src.startsWith('data:') || src.startsWith('http')) {
        console.log('🖼️ Using direct URL:', src)
        setImageUrl(src)
        return
      }

      // Handle relative paths or local file paths
      if (src.startsWith('./') || src.startsWith('/') || src.startsWith('file://') || /^[a-zA-Z]:\\|^\//.test(src)) {
        console.log('🖼️ Sending path conversion request:', src)
        setIsConverting(true)
        // Send message to extension requesting path conversion
        vscode.postMessage({
          type: 'convertImagePath',
          path: src
        })

        // Don't set original path to avoid 403 errors, wait for conversion result
        // imageUrl remains empty, showing placeholder
        return
      }

      // For other cases, use directly
      console.log('🖼️ Using source directly:', src)
      setImageUrl(src)
    }

    processImageSrc()
  }, [src])

  // Listen for image path conversion results from extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data

      if (message.type === 'imagePathConverted' && message.originalPath === src) {
        console.log('🖼️ Image path converted:', src, '->', message.convertedPath)

        // Check if converted path is same as original (indicates conversion failed)
        if (message.convertedPath === src) {
          console.log('❌ Image path conversion failed, using placeholder')
          setHasError(true)
          setIsConverting(false)
          setIsLoading(false)
          return
        }

        // Cache conversion result
        imageUrlCache.set(src, message.convertedPath)
        setImageUrl(message.convertedPath)
        setIsConverting(false)
        // Keep loading state, wait for actual image load result
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [src])

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // 创建占位符图片
  const createPlaceholder = () => {
    const statusText = hasError ? 'Image Load Failed' : 'Loading Image...'
    const svgContent = `<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="sans-serif" font-size="12">
        ${statusText}
      </text>
      <text x="50%" y="60%" text-anchor="middle" fill="#666" font-family="sans-serif" font-size="10">
        ${src}
      </text>
    </svg>`

    return `data:image/svg+xml;base64,${btoa(svgContent)}`
  }

  // 检查是否是 badge 图片
  const isBadge = src.includes('shields.io') ||
                  src.includes('badge.fury.io') ||
                  src.includes('badges.gitter') ||
                  src.includes('badgen.net')

  const badgeStyle = isBadge ? {
    height: '20px',
    maxWidth: 'none',
    display: 'inline-block',
    verticalAlign: 'middle',
    margin: '0 4px 4px 0'
  } : {
    maxWidth: '100%',
    height: 'auto'
  }

  return (
    <NodeViewWrapper>
      <img
        src={isConverting || !imageUrl || isLoading || hasError ? createPlaceholder() : imageUrl}
        alt={alt || 'Image'}
        title={title || ''}
        className="local-image"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          ...badgeStyle,
          opacity: isLoading ? 0.7 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </NodeViewWrapper>
  )
}

export default LocalImage