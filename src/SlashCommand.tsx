import { Extension } from '@tiptap/react'
import { Suggestion } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { getSuggestionItems, filterItems } from './suggestionItems'
import SuggestionMenu from './SuggestionMenu'

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
        items: ({ query, editor }) => filterItems(getSuggestionItems({ editor }), query),
        render: () => {
          let component: any
          let popup: any
          let selectedIndex = 0 // Initialize selected index

          const setSelectedIndex = (index: number) => {
            selectedIndex = index
            component?.updateProps({
              selectedIndex,
              setSelectedIndex,
            })
          }

          return {
            onStart: (props) => {
              component = new ReactRenderer(SuggestionMenu, {
                props: {
                  ...props,
                  selectedIndex,
                  setSelectedIndex,
                },
                editor: props.editor,
              })

              if (!props.clientRect) {
                return
              }

              popup = tippy('body', {
                getReferenceClientRect: () => props.clientRect?.() || new DOMRect(),
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })
            },

            onUpdate(props) {
              component.updateProps({
                ...props,
                selectedIndex,
                setSelectedIndex,
              })

              if (!props.clientRect) {
                return
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              })
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
              }

              return component.ref?.onKeyDown(props)
            },

            onExit() {
              popup[0].destroy()
              component.destroy()
            },
          }
        },
      }),
    ]
  },
})