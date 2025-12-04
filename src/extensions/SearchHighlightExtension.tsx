import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface SearchHighlightOptions {
  searchQuery: string
  currentMatchIndex: number
  searchResults: Array<{ start: number; end: number }>
}

export const SearchHighlightExtension = Extension.create<SearchHighlightOptions>({
  name: 'searchHighlight',

  addOptions() {
    return {
      searchQuery: '',
      currentMatchIndex: -1,
      searchResults: [],
    }
  },

  addStorage() {
    return {
      updateDecorations: () => {}
    }
  },

  addProseMirrorPlugins() {
    const extension = this

    return [
      new Plugin({
        key: new PluginKey('searchHighlight'),
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, oldState) => {
            // Check if there is search-related metadata
            const searchMeta = tr.getMeta('searchHighlight')

            let searchQuery = extension.options.searchQuery
            let currentMatchIndex = extension.options.currentMatchIndex
            let searchResults = extension.options.searchResults

            // If metadata exists, use values from metadata
            if (searchMeta) {
              searchQuery = searchMeta.searchQuery || searchQuery
              currentMatchIndex = searchMeta.currentMatchIndex ?? currentMatchIndex
              searchResults = searchMeta.searchResults || searchResults
            }

            // If document has not changed and there is no search metadata, return old state
            if (!tr.docChanged && !searchMeta) {
              return oldState
            }

            if (!searchQuery || searchResults.length === 0) {
              return DecorationSet.empty
            }

            const decorations: Decoration[] = []

            searchResults.forEach((match, index) => {
              const isCurrent = index === currentMatchIndex

              const decoration = Decoration.inline(
                match.start,
                match.end,
                {
                  class: isCurrent ? 'search-highlight-current' : 'search-highlight',
                },
                {
                  key: `search-${index}`,
                  inclusiveStart: false,
                  inclusiveEnd: false
                }
              )
              decorations.push(decoration)
            })

            return DecorationSet.create(tr.doc, decorations)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      updateSearchHighlight: (options: Partial<SearchHighlightOptions>) => ({ chain }: { chain: any }) => {
        return chain()
          .command(({ tr, dispatch }: { tr: any; dispatch: any }) => {
            if (dispatch) {
              const meta = {
                ...options,
                timestamp: Date.now()
              }
              tr.setMeta('searchHighlight', meta)
              return true
            }
            return false
          })
          .run()
      },
    } as any
  },
})