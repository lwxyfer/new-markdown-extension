import React, { useEffect, useRef, useState } from 'react'
import { SuggestionMenuProps } from './types'

const SuggestionMenu: React.FC<SuggestionMenuProps> = ({ items, command, selectedIndex = 0, setSelectedIndex }) => {
  const listRef = useRef<HTMLDivElement>(null)
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(selectedIndex)

  // Use the external setSelectedIndex if provided, otherwise use internal state
  const hasExternalSetSelectedIndex = typeof setSelectedIndex !== 'undefined'
  const actualSetSelectedIndex = hasExternalSetSelectedIndex ? setSelectedIndex : setInternalSelectedIndex
  const actualSelectedIndex = hasExternalSetSelectedIndex ? selectedIndex : internalSelectedIndex

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        actualSetSelectedIndex((actualSelectedIndex + items.length - 1) % items.length)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        actualSetSelectedIndex((actualSelectedIndex + 1) % items.length)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        command(items[actualSelectedIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [items, actualSelectedIndex, command, actualSetSelectedIndex])

  useEffect(() => {
    if (listRef.current && actualSelectedIndex >= 0) {
      const selectedElement = listRef.current.children[actualSelectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
        })
      }
    }
  }, [actualSelectedIndex])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="suggestion-menu" ref={listRef}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`suggestion-item ${index === actualSelectedIndex ? 'selected' : ''}`}
          onClick={() => command(item)}
        >
          <div className="suggestion-icon">{item.icon}</div>
          <div className="suggestion-content">
            <div className="suggestion-title">{item.title}</div>
            <div className="suggestion-description">{item.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SuggestionMenu