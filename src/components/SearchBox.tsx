import React, { useState, useEffect, useRef } from 'react'

interface SearchBoxProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  onNavigate: (direction: 'next' | 'prev') => void
  currentMatch: number
  totalMatches: number
}

const SearchBox: React.FC<SearchBoxProps> = ({
  isOpen,
  onClose,
  onSearch,
  onNavigate,
  currentMatch,
  totalMatches
}) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen])

  useEffect(() => {
    onSearch(query)
  }, [query, onSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        onClose()
        break
      case 'Enter':
        e.preventDefault()
        if (e.shiftKey) {
          onNavigate('prev')
        } else {
          onNavigate('next')
        }
        break
      case 'F3':
        e.preventDefault()
        onNavigate('next')
        break
    }
  }

  if (!isOpen) return null

  return (
    <div className="search-box">
      <div className="search-box-content">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="search-input"
        />

        <div className="search-stats">
          {totalMatches > 0 ? (
            <span className="match-count">
              {currentMatch}/{totalMatches}
            </span>
          ) : (
            <span className="no-matches">No results</span>
          )}
        </div>

        <div className="search-actions">
          <button
            type="button"
            className="search-nav-btn"
            onClick={() => onNavigate('prev')}
            title="Previous (Shift+Enter)"
            disabled={totalMatches === 0}
          >
            ↑
          </button>
          <button
            type="button"
            className="search-nav-btn"
            onClick={() => onNavigate('next')}
            title="Next (Enter)"
            disabled={totalMatches === 0}
          >
            ↓
          </button>
          <button
            type="button"
            className="search-close-btn"
            onClick={onClose}
            title="Close (ESC)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchBox