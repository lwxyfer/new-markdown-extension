import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import ImageDialog from './ImageDialog'

interface SlashCommandImageHandlerProps {
  editor: Editor
  range: { from: number; to: number }
  onComplete: () => void
}

const SlashCommandImageHandler: React.FC<SlashCommandImageHandlerProps> = ({
  editor,
  range,
  onComplete
}) => {
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    setShowDialog(true)
  }, [])

  const handleConfirm = (url: string) => {
    editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
    onComplete()
  }

  const handleClose = () => {
    onComplete()
  }

  return (
    <ImageDialog
      isOpen={showDialog}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="插入图片"
      placeholder="请输入图片 URL"
    />
  )
}

export default SlashCommandImageHandler