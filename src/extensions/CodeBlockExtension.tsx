import { ReactNodeViewRenderer } from '@tiptap/react'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import CodeBlockComponent from '../components/CodeBlockComponent'

const lowlight = createLowlight(common)

export const CodeBlockExtension = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent)
  },
}).configure({
  lowlight,
  defaultLanguage: 'plaintext',
})