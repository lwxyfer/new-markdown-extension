import React, { useState, useCallback, useEffect } from 'react';

interface VSCodeEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

// 简化的编辑器组件，专门用于 VSCode webview
const VSCodeEditor: React.FC<VSCodeEditorProps> = ({
  initialContent = '',
  onContentChange
}) => {
  const [content, setContent] = useState(initialContent);

  // 防抖函数
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay) as unknown as number;
    };
  }, []);

  // 防抖的内容变化处理
  const debouncedContentChange = useCallback(
    debounce((newContent: string) => {
      onContentChange?.(newContent);
    }, 500),
    [onContentChange]
  );

  // 处理内容变化
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    debouncedContentChange(newContent);
  }, [debouncedContentChange]);

  // 当初始内容变化时更新状态
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  return (
    <div className="vscode-markdown-editor">
      <div className="editor-header">
        <h3>New Markdown Editor</h3>
        <p>Rich WYSIWYG Markdown Editor for VSCode</p>
      </div>

      <div className="editor-container">
        <textarea
          className="markdown-textarea"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your markdown here..."
          spellCheck="false"
        />

        <div className="editor-preview">
          <h4>Preview (Basic):</h4>
          <div className="preview-content">
            {content ? (
              <div dangerouslySetInnerHTML={{
                __html: content
                  .replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
                  .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
                  .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
                  .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
              }} />
            ) : (
              <p className="preview-placeholder">
                Start typing to see the preview...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VSCodeEditor;