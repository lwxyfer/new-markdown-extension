# TipTap Markdown Editor 技术方案文档

## 项目概述

基于 TipTap v3 的现代化 Markdown 编辑器，提供所见即所得编辑体验，支持丰富的格式化功能和扩展能力。

## 技术栈

* **框架**: React 19 + TypeScript + Vite
* **编辑器**: TipTap v3.6.2 + ProseMirror
* **样式**: 自定义 CSS (Notion 风格)
* **代码高亮**: Lowlight + Prism.js
* **图表**: Mermaid v11.12.0
* **转换**: markdown-it + turndown

## 核心依赖

### 编辑器核心

```json
{
  "@tiptap/react": "^3.6.2",
  "@tiptap/starter-kit": "^3.6.2",
  "@tiptap/suggestion": "^3.6.2"
}
```

### 扩展功能

```json
{
  "@tiptap/extension-code-block-lowlight": "^3.6.2",
  "@tiptap/extension-highlight": "^3.6.2",
  "@tiptap/extension-image": "^3.6.2",
  "@tiptap/extension-link": "^3.6.2",
  "@tiptap/extension-subscript": "^3.6.2",
  "@tiptap/extension-superscript": "^3.6.2",
  "@tiptap/extension-table": "^3.6.2",
  "@tiptap/extension-task-item": "^3.6.2",
  "@tiptap/extension-task-list": "^3.6.2",
  "@tiptap/extension-text-align": "^3.6.2",
  "@tiptap/extension-underline": "^3.6.2"
}
```

### 工具库

```json
{
  "lowlight": "^3.3.0",
  "mermaid": "^11.12.0",
  "markdown-it": "^14.1.0",
  "turndown": "^7.2.1",
  "tippy.js": "^6.3.7"
}
```

## 项目结构

```
src/
├── App.tsx                 # 应用根组件
├── MarkdownEditor.tsx      # 编辑器主组件
├── MenuBar.tsx             # 工具栏组件
├── SlashCommand.tsx        # 斜杠命令扩展
├── SuggestionMenu.tsx      # 建议菜单组件
├── suggestionItems.ts      # 命令项配置
├── types.ts                # 类型定义
├── index.css               # 全局样式
└── notion.css              # Notion 风格样式
```

## 核心功能实现

### 1. 编辑器初始化

```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'plaintext'
    }),
    Table.configure({ resizable: true }),
    TableRow, TableHeader, TableCell,
    Image, Link, TaskList, TaskItem,
    Highlight, Underline, Subscript, Superscript,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    SlashCommand,
    MermaidExtension
  ]
});
```

### 2. 自定义 Mermaid 扩展

```typescript
const MermaidExtension = Node.create({
  name: 'mermaid',
  content: 'text*',
  parseHTML: () => [{ tag: 'div[data-mermaid]' }],
  renderHTML: ({ HTMLAttributes }) => [
    'div', mergeAttributes(HTMLAttributes, { 'data-mermaid': '' }), 0
  ],
  addNodeView: () => ReactNodeViewRenderer(MermaidComponent)
});
```

### 3. 斜杠命令系统

```typescript
export const SlashCommand = Extension.create({
  name: 'slashCommand',
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        items: ({ query, editor }) => filterItems(getSuggestionItems({ editor }), query),
        render: () => ({ /* Tippy.js 渲染逻辑 */ })
      })
    ];
  }
});
```

### 4. Markdown 双向转换

```typescript
// HTML → Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

// Markdown → HTML
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
```

### 5. 工具栏实现

```typescript
const MenuBar = ({ editor }) => (
  <div className="notion-toolbar">
    <div className="notion-toolbar-group">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`notion-button ${editor.isActive('bold') ? 'notion-button-active' : ''}`}
      >
        B
      </button>
      {/* 其他按钮 */}
    </div>
  </div>
);
```

## 样式设计

### CSS 变量系统

```css
:root {
  --notion-bg: #ffffff;
  --notion-text: #37352f;
  --notion-border: #e9e9e7;
  --notion-toolbar-bg: #f7f6f3;
  --notion-button-hover: #f1f1ef;
  --notion-active: #2383e2;
}
```

### 响应式布局

```css
.notion-editor {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 96px;
}

@media (max-width: 768px) {
  .notion-editor {
    padding: 20px;
  }
}
```

## 命令配置

### 建议项配置示例

```typescript
{
  title: '标题 1',
  description: '大号标题',
  icon: '📝',
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
  },
  keywords: ['h1', 'heading1', 'title', '标题', '大标题']
}
```

## 部署配置

### Vite 配置

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mermaid': ['mermaid'],
          'tiptap': ['@tiptap/react', '@tiptap/starter-kit']
        }
      }
    }
  }
});
```

## 特性清单

* ✅ 富文本编辑 (粗体、斜体、下划线、删除线)
* ✅ 标题层级 (H1-H3)
* ✅ 列表 (有序、无序、任务列表)
* ✅ 引用块和代码块 (语法高亮)
* ✅ 表格 (可调整大小)
* ✅ 图片和链接
* ✅ Mermaid 图表
* ✅ 文本对齐和高亮
* ✅ 上标和下标
* ✅ 斜杠命令快速插入
* ✅ Markdown 导入导出
* ✅ 撤销重做
* ✅ 键盘快捷键

## 开发命令

```bash
npm install          # 安装依赖
npm run dev         # 开发服务器
npm run build       # 生产构建
npm run lint        # 代码检查
```

## 关键实现要点


1. **StarterKit 集成**: 避免重复安装基础扩展
2. **类型安全**: 完整的 TypeScript 类型定义
3. **样式隔离**: 使用 CSS 类前缀避免冲突
4. **性能优化**: 代码分割和懒加载
5. **扩展性**: 模块化的扩展系统设计


