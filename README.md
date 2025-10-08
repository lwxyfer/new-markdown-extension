# New Markdown Editor - VSCode Extension

一个功能丰富的所见即所得 Markdown 编辑器，专为 VSCode 设计，支持 Mermaid 图表和代码高亮。

## 功能特性

- ✅ 富文本编辑（粗体、斜体、下划线等）
- ✅ 标题层级（H1-H6）
- ✅ 列表（有序、无序、任务列表）
- ✅ 代码块和语法高亮
- ✅ 表格支持
- ✅ 图片和链接
- ✅ 斜杠命令快速插入
- ✅ Mermaid 图表渲染
- ✅ 全屏预览
- ✅ 实时预览

## 安装

1. 在 VSCode 中打开扩展面板 (Ctrl+Shift+X)
2. 搜索 "New Markdown Editor"
3. 点击安装

或者从 VSIX 文件安装：

```bash
code --install-extension new-markdown-editor-1.0.0.vsix
```

## 使用方法

1. 打开一个 `.md` 文件
2. 右键点击文件，选择 "Open With"
3. 选择 "New Markdown Editor"
4. 或者，在文件标签页右键选择 "Reopen Editor With" > "New Markdown Editor"

## 快捷键

- `Ctrl+B` / `Cmd+B` - 粗体
- `Ctrl+I` / `Cmd+I` - 斜体
- `Ctrl+K` / `Cmd+K` - 插入链接
- `/` - 打开命令菜单

## 支持的 Mermaid 图表类型

- 流程图 (Flowchart)
- 序列图 (Sequence Diagram)
- 类图 (Class Diagram)
- 状态图 (State Diagram)
- 甘特图 (Gantt)
- 饼图 (Pie Chart)
- 等等...

## 开发

### 构建扩展

```bash
npm run build:all
npm run package
```

### 调试

1. 在 VSCode 中打开此项目
2. 按 F5 启动调试
3. 在扩展开发主机中测试扩展

## 许可证

MIT