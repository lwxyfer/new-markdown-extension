import { Image } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import LocalImage from '../components/LocalImage'

// Handle image URLs in VSCode environment
const processImageUrlForVSCode = (url: string): string => {
  // If it's a data URL or relative path, return directly
  if (url.startsWith('data:') || url.startsWith('./') || url.startsWith('/')) {
    return url
  }

  // Handle local file paths (file:// or absolute paths)
  if (url.startsWith('file://') || /^[a-zA-Z]:\\|^\//.test(url)) {
    // In VSCode Webview, local file paths need to be converted to accessible URIs via vscode API
    // Here we return the raw path, let the frontend component handle the conversion
    return url
  }

  // For external URLs, VSCode Webview allows loading by default
  // But need to ensure CSP policy allows it
  return url
}

// Custom image extension to handle VSCode Webview security restrictions
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

          // Handle external images in VSCode Webview
          if (typeof window !== 'undefined' && (window as any).vscode) {
            src = processImageUrlForVSCode(src)
          }

          return {
            src,
            alt: attributes.alt || 'Image',
            title: attributes.title || '',
            'data-original-src': attributes.src // Save original URL
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
