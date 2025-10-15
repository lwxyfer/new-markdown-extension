import { Image } from '@tiptap/extension-image'

// 自定义图片扩展，处理 VSCode Webview 的安全限制
export const ImageExtension = Image.extend({
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
            src = this.processImageUrlForVSCode(src)
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

  // 在 VSCode 环境中处理图片 URL
  processImageUrlForVSCode(url: string): string {
    // 如果是 data URL 或相对路径，直接返回
    if (url.startsWith('data:') || url.startsWith('./') || url.startsWith('/')) {
      return url
    }

    // 对于外部 URL，VSCode Webview 默认允许加载
    // 但需要确保 CSP 策略允许
    return url
  },
})

// 图片插入工具类
export class ImageHelper {
  // 验证图片 URL 是否可访问
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  // 创建占位符图片
  static createPlaceholderImage(width: number = 200, height: number = 150): string {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="sans-serif" font-size="12">
          图片预览
        </text>
        <text x="50%" y="60%" text-anchor="middle" fill="#666" font-family="sans-serif" font-size="10">
          ${width}×${height}
        </text>
      </svg>
    `)}`
  }

  // 获取图片信息
  static async getImageInfo(url: string): Promise<{ width: number; height: number; type: string } | null> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          type: url.split('.').pop()?.toLowerCase() || 'unknown'
        })
      }
      img.onerror = () => {
        resolve(null)
      }
      img.src = url
    })
  }
}