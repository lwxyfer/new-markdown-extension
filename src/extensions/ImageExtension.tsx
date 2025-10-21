import { Image } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import LocalImage from '../components/LocalImage'

// 在 VSCode 环境中处理图片 URL
const processImageUrlForVSCode = (url: string): string => {
  // 如果是 data URL 或相对路径，直接返回
  if (url.startsWith('data:') || url.startsWith('./') || url.startsWith('/')) {
    return url
  }

  // 处理本地文件路径 (file:// 或绝对路径)
  if (url.startsWith('file://') || /^[a-zA-Z]:\\|^\//.test(url)) {
    // 在 VSCode Webview 中，本地文件路径需要通过 vscode API 转换为可访问的 URI
    // 这里返回原始路径，由前端组件处理转换
    return url
  }

  // 对于外部 URL，VSCode Webview 默认允许加载
  // 但需要确保 CSP 策略允许
  return url
}

// 自定义图片扩展，处理 VSCode Webview 的安全限制
export const ImageExtension = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(LocalImage)
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: element => {
          return element.getAttribute('src')
        },
        renderHTML: attributes => {
          if (!attributes.src) {
            return {}
          }

          let src = attributes.src

          // 在 VSCode Webview 中处理外部图片
          if (typeof window !== 'undefined' && (window as any).vscode) {
            src = processImageUrlForVSCode(src)
          }

          return {
            src,
            alt: attributes.alt || 'Image',
            title: attributes.title || '',
            'data-original-src': attributes.src // 保存原始 URL
          }
        },
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    }
  },

  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})
