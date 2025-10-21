import * as vscode from 'vscode';
import { getNonce } from '../utils/utils';

export class MarkdownEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    console.log(`🔧 Resolving custom editor for: ${document.uri.toString()}`);

    // Setup initial content for the webview
    // 构建允许访问的资源根目录
    const localResourceRoots = [
      vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
      vscode.Uri.joinPath(this.context.extensionUri, 'assets'),
    ];

    // 添加工作区文件夹
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      workspaceFolders.forEach(folder => {
        localResourceRoots.push(folder.uri);
      });
    } else {
      // 如果没有工作区，添加文档所在目录
      const documentDir = vscode.Uri.joinPath(document.uri, '..');
      localResourceRoots.push(documentDir);
    }

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: localResourceRoots
    };

    console.log('🔧 Local resource roots configured:');
    localResourceRoots.forEach((root, index) => {
      console.log(`  [${index}] ${root.toString()}`);
    });

    const html = this.getHtmlForWebview(webviewPanel.webview, document.getText());
    webviewPanel.webview.html = html;
    console.log('✅ Webview HTML set successfully');

    // Handle messages from the webview
    webviewPanel.webview.onDidReceiveMessage(e => {
      switch (e.type) {
        case 'edit':
          console.log('Received edit from webview');
          this.updateDocument(document, e.content);
          return;
        case 'ready':
          // Webview is ready
          return;
        case 'convertImagePath':
          console.log('🖼️ Received convertImagePath request:', e.path);
          console.log('📄 Document URI:', document.uri.toString());
          console.log('📁 Workspace folder:', vscode.workspace.getWorkspaceFolder(document.uri)?.uri.toString());
          console.log('🔧 Workspace folders count:', vscode.workspace.workspaceFolders?.length || 0);
          this.handleImagePathConversion(webviewPanel, document, e.path);
          return;
      }
    });

    // Update the webview when the document changes
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        console.log('Document changed, sending update to webview');
        webviewPanel.webview.postMessage({
          type: 'update',
          text: document.getText()
        });
      }
    });

    // Clean up when the webview panel is disposed
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });
  }

  private async updateDocument(document: vscode.TextDocument, content: string) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      content
    );

    // 应用编辑，这会自动设置文档为 dirty 状态
    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
      console.log('Document updated successfully, dirty state should be set');
    } else {
      console.log('Failed to update document');
    }
  }

  private async handleImagePathConversion(
    webviewPanel: vscode.WebviewPanel,
    document: vscode.TextDocument,
    imagePath: string
  ) {
    try {
      console.log('🔄 Starting image path conversion for:', imagePath);
      let convertedPath = imagePath;

      // 处理相对路径
      if (imagePath.startsWith('./') || imagePath.startsWith('/')) {
        console.log('📁 Processing relative path');
        // 获取文档所在目录
        const documentDir = vscode.Uri.joinPath(document.uri, '..');
        console.log('📄 Document directory:', documentDir.toString());

        // 构建绝对路径
        let absolutePath: vscode.Uri;
        if (imagePath.startsWith('./')) {
          // 相对路径：相对于文档所在目录
          absolutePath = vscode.Uri.joinPath(documentDir, imagePath.replace(/^\.\//, ''));
          console.log('📍 Relative path - absolute path:', absolutePath.toString());
        } else {
          // 绝对路径：相对于工作区根目录
          const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
          if (workspaceFolder) {
            console.log('🏢 Using workspace folder:', workspaceFolder.uri.toString());
            absolutePath = vscode.Uri.joinPath(workspaceFolder.uri, imagePath.replace(/^\//, ''));
            console.log('📍 Absolute path - workspace path:', absolutePath.toString());
          } else {
            // 如果没有工作区，使用文档所在目录
            console.log('⚠️ No workspace folder, using document directory');
            absolutePath = vscode.Uri.joinPath(documentDir, imagePath.replace(/^\//, ''));
            console.log('📍 Absolute path - document path:', absolutePath.toString());
          }
        }

        // 转换为 Webview 可访问的 URI
        convertedPath = webviewPanel.webview.asWebviewUri(absolutePath).toString();
        console.log('🔗 Converted to webview URI:', convertedPath);
      }
      // 处理绝对路径或 file:// 路径
      else if (imagePath.startsWith('file://') || /^[a-zA-Z]:\\|^\//.test(imagePath)) {
        console.log('💾 Processing file path');
        let fileUri: vscode.Uri;

        if (imagePath.startsWith('file://')) {
          fileUri = vscode.Uri.parse(imagePath);
        } else {
          fileUri = vscode.Uri.file(imagePath);
        }

        console.log('📄 File URI:', fileUri.toString());

        // 转换为 Webview 可访问的 URI
        convertedPath = webviewPanel.webview.asWebviewUri(fileUri).toString();
        console.log('🔗 Converted to webview URI:', convertedPath);
      }

      console.log('✅ Image path converted:', imagePath, '->', convertedPath);

      // 发送转换后的路径回 Webview
      webviewPanel.webview.postMessage({
        type: 'imagePathConverted',
        originalPath: imagePath,
        convertedPath: convertedPath
      });
      console.log('📤 Sent conversion result to webview');
    } catch (error) {
      console.error('❌ Failed to convert image path:', error);

      // 发送错误信息回 Webview
      webviewPanel.webview.postMessage({
        type: 'imagePathConverted',
        originalPath: imagePath,
        convertedPath: imagePath // 返回原始路径作为兜底
      });
    }
  }

  private getHtmlForWebview(webview: vscode.Webview, content: string): string {
    // Get the local path to main script run in the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js')
    );

    // Get the local path to css styles
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'reset.css')
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'vscode.css')
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'main.css')
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return /* html */`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data: file:;">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <title>New Markdown Editor</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          window.initialContent = ${JSON.stringify(content)};
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}