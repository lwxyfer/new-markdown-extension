import { ReactNodeViewRenderer } from '@tiptap/react'
import { Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Fragment } from '@tiptap/pm/model'
import MermaidComponent from '../components/MermaidComponent'

export interface MermaidOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaid: {
      /**
       * Add a mermaid diagram
       */
      setMermaid: (attributes?: { content: string }) => ReturnType
    }
  }
}

export const MermaidExtension = Node.create<MermaidOptions>({
  name: 'mermaid',

  group: 'block',

  content: 'text*',

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      content: {
        default: '',
        parseHTML: element => element.getAttribute('data-content') || element.textContent,
        renderHTML: attributes => ({
          'data-content': attributes.content,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid"]',
        preserveWhitespace: 'full',
        getContent: (node, schema) => {
          const content = (node as HTMLElement).getAttribute('data-content') || ''
          return Fragment.from(schema.text(content))
        },
      },
    ]
  },

  renderHTML({ node }) {
    return [
      'div',
      {
        'data-type': 'mermaid',
        'data-content': node.attrs.content,
        class: 'mermaid-diagram',
      },
      node.attrs.content,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent)
  },

  addCommands() {
    return {
      setMermaid:
        attributes =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('mermaidCodeBlock'),
        props: {
          handlePaste: (view, event) => {
            const { clipboardData } = event
            if (!clipboardData) return false

            const text = clipboardData.getData('text/plain')
            if (!text) return false

            // Check if the pasted text looks like mermaid code
            if (text.trim().startsWith('```mermaid') && text.includes('```')) {
              const mermaidContent = text
                .replace(/```mermaid\s*/, '')
                .replace(/```$/, '')
                .trim()

              const { state, dispatch } = view
              const { tr } = state

              const node = state.schema.nodes.mermaid.create({
                content: mermaidContent,
              })

              tr.replaceSelectionWith(node)
              dispatch(tr)
              return true
            }

            return false
          },
        },
      }),
    ]
  },
})