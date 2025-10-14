# Claude Code - Project Documentation

This document provides essential information for working with this VSCode Markdown Editor extension project.

## Project Structure

```
src/
├── components/          # React components
│   ├── App.tsx
│   ├── CodeBlockComponent.tsx
│   ├── FloatingToolbar.tsx
│   ├── MenuBar.tsx
│   ├── MermaidComponent.tsx
│   ├── MermaidFullscreen.tsx
│   ├── SlashCommand.tsx
│   ├── SuggestionMenu.tsx
│   ├── VSCodeEditor.tsx
│   └── VSCodeMarkdownEditor.tsx
├── core/                # Core extension logic
│   ├── MarkdownEditorProvider.ts
│   ├── extension.ts
│   ├── messageTypes.ts
│   └── webview.tsx
├── extensions/          # TipTap extensions
│   ├── BubbleMenuExtension.tsx
│   ├── CodeBlockExtension.tsx
│   └── MermaidExtension.tsx
├── styles/              # CSS stylesheets
│   ├── index.css
│   ├── main.css
│   ├── notion.css
│   ├── reset.css
│   └── vscode.css
├── types/               # TypeScript type definitions
│   └── types.ts
└── utils/               # Utility functions
    ├── debounce.ts
    ├── markdownUtils.ts
    ├── suggestionItems.ts
    └── utils.ts
```

## Build Commands

* `npm run build` - Build the extension for production
* `npm run build:dev` - Build the extension for development
* `npm run build:webview` - Build the webview components
* `npm run watch` - Watch for changes and rebuild
* `npm run package` - Package the extension for distribution

## Development Workflow


1. **Build the extension**:

   ```bash
   npm run build
   ```
2. **Test in VSCode**:
   * Press `F5` to open Extension Development Host
   * Open a `.md` file to test the editor
3. **Development mode**:

   ```bash
   npm run watch
   ```

## Key Files

* `build.js` - Custom build script for VSCode extension
* `package.json` - Extension manifest and dependencies
* `tsconfig.extension.json` - TypeScript config for extension
* `vite.webview.config.js` - Vite config for webview

## Extension Features

* Rich Markdown editing with TipTap
* Code block syntax highlighting
* Mermaid diagram support
* Slash commands for quick formatting
* Bubble menus and floating toolbars
* VSCode integration

## Notes

* The build process automatically moves compiled files from subdirectories to the root `dist/` folder
* CSS files are copied from `src/styles/` to `dist/` during build
* Import paths are automatically fixed in the build process

## Git 提交提醒

**重要：在以下情况下必须提醒用户进行 git 提交：**

* ✅ 新功能开发完成
* ✅ 重大重构（目录结构调整等）
* ✅ 重要 bug 修复
* ✅ 依赖更新或配置变更
* ✅ 代码审查后的修改
* ✅ 每日工作结束前

提交前请确保：

* 运行 `npm run build` 检查编译
* 检查 git status 确认所有相关文件
* 使用规范的提交信息格式

## Troubleshooting

If you encounter build issues:


1. Run `npm run build` to see detailed error messages
2. Check that all TypeScript files compile correctly
3. Verify that the `dist/` directory structure matches expectations


