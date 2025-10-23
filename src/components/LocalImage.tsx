import React, { useState, useEffect, useRef } from 'react'
import { ReactNodeViewProps, NodeViewWrapper } from '@tiptap/react'

// 使用全局的 vscode API，已在其他文件中声明

// 全局缓存，避免重复转换
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
    // 避免重复处理
    if (hasProcessedRef.current) {
      return
    }
    hasProcessedRef.current = true

    const processImageSrc = async () => {
      console.log('🖼️ Processing image source:', src)

      // 检查缓存
      if (imageUrlCache.has(src)) {
        console.log('🖼️ Using cached URL:', imageUrlCache.get(src))
        setImageUrl(imageUrlCache.get(src)!)
        setIsLoading(false)
        return
      }

      // 如果是 data URL 或网络 URL，直接使用
      if (src.startsWith('data:') || src.startsWith('http')) {
        console.log('🖼️ Using direct URL:', src)
        setImageUrl(src)
        return
      }

      // 处理相对路径或本地文件路径
      if (src.startsWith('./') || src.startsWith('/') || src.startsWith('file://') || /^[a-zA-Z]:\\|^\//.test(src)) {
        console.log('🖼️ Sending path conversion request:', src)
        setIsConverting(true)
        // 发送消息给扩展，请求转换图片路径
        vscode.postMessage({
          type: 'convertImagePath',
          path: src
        })

        // 不设置原始路径，避免403错误，等待转换结果
        // 此时 imageUrl 保持为空，显示占位符
        return
      }

      // 其他情况直接使用
      console.log('🖼️ Using source directly:', src)
      setImageUrl(src)
    }

    processImageSrc()
  }, [src])

  // 监听来自扩展的图片路径转换结果
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data

      if (message.type === 'imagePathConverted' && message.originalPath === src) {
        console.log('🖼️ Image path converted:', src, '->', message.convertedPath)

        // 检查转换后的路径是否与原始路径相同（表示转换失败）
        if (message.convertedPath === src) {
          console.log('❌ Image path conversion failed, using placeholder')
          setHasError(true)
          setIsConverting(false)
          setIsLoading(false)
          return
        }

        // 缓存转换结果
        imageUrlCache.set(src, message.convertedPath)
        setImageUrl(message.convertedPath)
        setIsConverting(false)
        // 保持 loading 状态，等待图片实际加载结果
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