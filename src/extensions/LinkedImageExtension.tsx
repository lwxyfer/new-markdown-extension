import { Image } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import LinkedImageComponent from '../components/LinkedImage'

// 自定义链接图片扩展，处理 [![text](img)](link) 格式
export const LinkedImageExtension = Image.extend({
  name: 'linkedImage',

  addNodeView() {
    return ReactNodeViewRenderer(LinkedImageComponent)
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
          return {
            src: attributes.src,
            alt: attributes.alt || 'Image',
            title: attributes.title || '',
          }
        },
      },
      href: {
        default: null,
        parseHTML: element => {
          // 如果是 a 标签包裹的 img，提取 href
          const parent = element.parentElement
          if (parent?.tagName === 'A') {
            return parent.getAttribute('href')
          }
          return null
        },
        renderHTML: attributes => {
          if (!attributes.href) {
            return {}
          }
          return {
            'data-href': attributes.href
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

  parseHTML() {
    return [
      {
        tag: 'img',
        getAttrs: node => {
          const img = node as HTMLElement
          const parent = img.parentElement

          // 如果是 a 标签包裹的 img，创建 linkedImage 节点
          if (parent?.tagName === 'A' && parent.hasAttribute('href')) {
            return {
              src: img.getAttribute('src'),
              alt: img.getAttribute('alt'),
              href: parent.getAttribute('href'),
              'data-github-badge': parent.getAttribute('data-github-badge'),
              'data-image-link': parent.getAttribute('data-image-link'),
            }
          }

          // 处理普通图片
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { href, ...imgAttributes } = HTMLAttributes

    if (href) {
      // 渲染为 a 标签包裹 img
      return [
        'a',
        {
          href,
          'data-github-badge': node.attrs['data-github-badge'],
          'data-image-link': node.attrs['data-image-link'],
        },
        ['img', imgAttributes],
      ]
    }

    // 普通图片
    return ['img', imgAttributes]
  },
})