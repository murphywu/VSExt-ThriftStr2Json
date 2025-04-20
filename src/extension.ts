// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { parseThriftObject } from './thriftToJsonConverter';

// 正则表达式匹配 thrift toString 输出格式
const THRIFT_TO_STRING_REGEX = /([A-Za-z0-9_]+)\((.*)\)/;

// 用于识别完整嵌套对象的函数，处理括号嵌套的情况
function findCompleteThriftObject(text: string): string | null {
  const startMatch = text.match(/([A-Za-z0-9_]+)\(/);
  if (!startMatch) {
    return null;
  }

  const startPos = startMatch.index!;
  const typeName = startMatch[1];
  let depth = 0;
  let inQuotes = false;
  let escapeNext = false;

  // 从匹配的对象名称开始查找
  for (let i = startPos; i < text.length; i++) {
    const char = text[i];

    // 处理转义字符
    if (!escapeNext && char === '\\') {
      escapeNext = true;
      continue;
    }

    if (!escapeNext && (char === '"' || char === "'")) {
      inQuotes = !inQuotes;
    } else {
      escapeNext = false;
    }

    // 只有不在引号内才计算括号深度
    if (!inQuotes) {
      if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
        // 当找到匹配的右括号时，返回完整的对象文本
        if (depth === 0) {
          return text.substring(startPos - typeName.length, i + 1);
        }
      }
    }
  }

  return null; // 如果没有找到完整匹配，返回null
}

// 转换 thrift toString 文本为 JSON 格式
function convertThriftToStringToJson(text: string): string {
  const match = THRIFT_TO_STRING_REGEX.exec(text);
  if (!match) {
    return '';
  }

  try {
    // 使用引入的thriftToJsonConverter进行转换
    const result = parseThriftObject(text);
    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error('Error parsing thrift toString:', error);
    return `// Error parsing thrift toString: ${error}\n${text}`;
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Extension "thrift-string-to-json" is now active!');

  // 注册上下文菜单命令
  const contextMenuCommand = vscode.commands.registerTextEditorCommand(
    'thrift-string-to-json.contextMenuConvert',
    (editor) => {
      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showErrorMessage('请选择要转换的文本！');
        return;
      }

      // 获取从选中开始位置到行尾之间的文本
      const line = editor.document.lineAt(selection.end.line);
      const selectionStartPos = selection.start.character;
      const textFromSelectionToEnd = line.text.substring(selectionStartPos);

      // 查找完整的嵌套Thrift对象文本
      const completeObj = findCompleteThriftObject(textFromSelectionToEnd);
      if (!completeObj) {
        vscode.window.showErrorMessage('所选文本不符合 thrift toString 格式！');
        return;
      }

      // 获取匹配的完整文本
      const lineText = completeObj;

      const jsonText = convertThriftToStringToJson(lineText);

      vscode.workspace
        .openTextDocument({ content: jsonText, language: 'json' })
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));
    }
  );

  // 添加到 context.subscriptions
  context.subscriptions.push(contextMenuCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {
  // 清理资源
}
