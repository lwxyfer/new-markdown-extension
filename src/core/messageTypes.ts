// VSCode 与 Webview 通信消息类型定义

export interface VSCodeMessage {
  type: string;
  [key: string]: any;
}

// VSCode → Webview (Extension → App)
export interface UpdateMessage extends VSCodeMessage {
  type: 'update';
  text: string;
}

// Webview → VSCode (App → Extension)
export interface AddMessage extends VSCodeMessage {
  type: 'add';
  text: string;
}

export interface OpenLinkMessage extends VSCodeMessage {
  type: 'openLink';
  text: string;
}

export interface ReadyMessage extends VSCodeMessage {
  type: 'ready';
}

export interface SaveMessage extends VSCodeMessage {
  type: 'save';
  content: string;
}

// 消息类型守卫
export function isUpdateMessage(message: VSCodeMessage): message is UpdateMessage {
  return message.type === 'update';
}

export function isAddMessage(message: VSCodeMessage): message is AddMessage {
  return message.type === 'add';
}

export function isOpenLinkMessage(message: VSCodeMessage): message is OpenLinkMessage {
  return message.type === 'openLink';
}

export function isReadyMessage(message: VSCodeMessage): message is ReadyMessage {
  return message.type === 'ready';
}

export function isSaveMessage(message: VSCodeMessage): message is SaveMessage {
  return message.type === 'save';
}