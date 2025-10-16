import React, { useState, useEffect } from 'react'

interface ImageDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (url: string) => void
  title?: string
  placeholder?: string
}

const ImageDialog: React.FC<ImageDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '插入图片',
  placeholder = '请输入图片 URL'
}) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setUrl('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError('请输入有效的图片 URL')
      return
    }

    // 简单的 URL 验证
    try {
      new URL(url)
      onConfirm(url.trim())
      onClose()
    } catch {
      setError('请输入有效的 URL 地址')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="image-dialog-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        className="image-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '400px',
          maxWidth: '90vw'
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>
          {title}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${error ? '#e74c3c' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {error && (
              <div style={{
                color: '#e74c3c',
                fontSize: '12px',
                marginTop: '4px'
              }}>
                {error}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa',
                color: '#333',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ImageDialog