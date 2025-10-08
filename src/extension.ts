import * as vscode from 'vscode';
import { MarkdownEditorProvider } from './MarkdownEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('🔧 New Markdown Editor extension is activating...');

  // Register our custom editor provider
  const provider = new MarkdownEditorProvider(context);

  const providerRegistration = vscode.window.registerCustomEditorProvider(
    'new-markdown.markdownEditor',
    provider,
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
      supportsMultipleEditorsPerDocument: false,
    }
  );

  context.subscriptions.push(providerRegistration);
  console.log('✅ New Markdown Editor extension activated successfully!');
}

export function deactivate() {}