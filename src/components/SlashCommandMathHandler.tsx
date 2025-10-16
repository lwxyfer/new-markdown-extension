import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import FormulaDialog from './FormulaDialog'

interface SlashCommandMathHandlerProps {
  editor: Editor
  range: { from: number; to: number }
  onComplete: () => void
  mathType: 'inline' | 'block'
}

const SlashCommandMathHandler: React.FC<SlashCommandMathHandlerProps> = ({
  editor,
  range,
  onComplete,
  mathType
}) => {
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    setShowDialog(true)
  }, [])

  const handleConfirm = (formula: string) => {
    if (mathType === 'inline') {
      editor.chain().focus().deleteRange(range).insertInlineMath({ latex: formula }).run()
    } else {
      editor.chain().focus().deleteRange(range).insertBlockMath({ latex: formula }).run()
    }
    onComplete()
  }

  const handleClose = () => {
    onComplete()
  }

  return (
    <FormulaDialog
      isOpen={showDialog}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={mathType === 'inline' ? '插入行内数学公式' : '插入块级数学公式'}
      placeholder="请输入 LaTeX 公式"
      mathType={mathType}
    />
  )
}

export default SlashCommandMathHandler