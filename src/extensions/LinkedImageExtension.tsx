import { Image } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import LinkedImageComponent from '../components/LinkedImage'

// Custom linked image extension to handle [![text](img)](link) format
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
          // If wrapped in an a tag, extract href
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

          // If img is wrapped in an a tag, create linkedImage node
          if (parent?.tagName === 'A' && parent.hasAttribute('href')) {
            return {
              src: img.getAttribute('src'),
              alt: img.getAttribute('alt'),
              href: parent.getAttribute('href'),
              'data-github-badge': parent.getAttribute('data-github-badge'),
              'data-image-link': parent.getAttribute('data-image-link'),
            }
          }

          // Handle normal image
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
      // Render as img wrapped in a tag
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

    // Normal image
    return ['img', imgAttributes]
  },
})