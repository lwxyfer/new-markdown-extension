import React, { useEffect, useRef, useState } from 'react'
import { SuggestionMenuProps } from '../types/types'
import SlashCommandImageHandler from './SlashCommandImageHandler'
import SlashCommandMathHandler from './SlashCommandMathHandler'
import {
  Heading1,
  Heading2,
  Heading3,
  Type,
  Bold,
  Italic,
  Code,
  Code2,
  Quote,
  List,
  ListOrdered,
  SquareCheck,
  Table,
  Image,
  Link,
  Workflow,
  Square
} from 'lucide-react'

// 图标映射函数
const getIconComponent = (iconString: string) => {
  const iconMap = {
    'heading1': () => <Heading1 size={16} />,
    'heading2': () => <Heading2 size={16} />,
    'heading3': () => <Heading3 size={16} />,
    'paragraph': () => <Type size={16} />,
    'bold': () => <Bold size={16} />,
    'italic': () => <Italic size={16} />,
    'code': () => <Code size={16} />,
    'codeblock': () => <Code2 size={16} />,
    'quote': () => <Quote size={16} />,
    'bulletlist': () => <List size={16} />,
    'orderedlist': () => <ListOrdered size={16} />,
    'tasklist': () => <SquareCheck size={16} />,
    'table': () => <Table size={16} />,
    'image': () => <Image size={16} />,
    'link': () => <Link size={16} />,
    'mermaid': () => <Workflow size={16} />,
    'math': () => <Square size={16} />
  }

  const IconComponent = iconMap[iconString as keyof typeof iconMap] || (() => <Type size={16} />)
  return <IconComponent />
}

const SuggestionMenu: React.FC<SuggestionMenuProps> = ({ items, command, selectedIndex = 0, setSelectedIndex, editor, range }) => {
  const listRef = useRef<HTMLDivElement>(null)
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(selectedIndex)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageCommandData, setImageCommandData] = useState<{ editor: any; range: any } | null>(null)
  const [showMathDialog, setShowMathDialog] = useState(false)
  const [mathCommandData, setMathCommandData] = useState<{ editor: any; range: any; mathType: 'inline' | 'block' } | null>(null)

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
        const selectedItem = items[actualSelectedIndex]

        // 执行命令并检查返回类型
        const result = command(selectedItem) as any

        // 如果是图片项，显示自定义对话框
        if (result?.type === 'image' && editor && range) {
          setImageCommandData({
            editor,
            range
          })
          setShowImageDialog(true)
        } else if (result?.type === 'math' && editor && range) {
          setMathCommandData({
            editor,
            range,
            mathType: result.mathType
          })
          setShowMathDialog(true)
        } else {
          // 对于普通命令，不需要特殊处理，命令已经执行
        }
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

  const handleItemClick = (item: any) => {
    // 执行命令并检查返回类型
    const result = command(item) as any

    // 如果是图片项，显示自定义对话框
    if (result?.type === 'image' && editor && range) {
      setImageCommandData({
        editor,
        range
      })
      setShowImageDialog(true)
    } else if (result?.type === 'math' && editor && range) {
      setMathCommandData({
        editor,
        range,
        mathType: result.mathType
      })
      setShowMathDialog(true)
    } else {
      // 对于普通命令，不需要特殊处理，命令已经执行
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <>
      <div className="suggestion-menu" ref={listRef}>
        {items.map((item: any, index: number) => (
          <div
            key={index}
            className={`suggestion-item ${index === actualSelectedIndex ? 'selected' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <div className="suggestion-icon">{getIconComponent(item.icon)}</div>
            <div className="suggestion-title">{item.title}</div>
          </div>
        ))}
      </div>

      {showImageDialog && imageCommandData && (
        <SlashCommandImageHandler
          editor={imageCommandData.editor}
          range={imageCommandData.range}
          onComplete={() => {
            setShowImageDialog(false)
            setImageCommandData(null)
          }}
        />
      )}

      {showMathDialog && mathCommandData && (
        <SlashCommandMathHandler
          editor={mathCommandData.editor}
          range={mathCommandData.range}
          mathType={mathCommandData.mathType}
          onComplete={() => {
            setShowMathDialog(false)
            setMathCommandData(null)
          }}
        />
      )}
    </>
  )
}

export default SuggestionMenu