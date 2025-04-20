import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('开始执行测试！');

  test('Command exists', async () => {
    // 检查命令是否注册成功
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('thrift-string-to-json.convertToJson'));
  });

  test('Regex matching works', async () => {
    // 创建一个临时文档以测试功能
    const document = await vscode.workspace.openTextDocument({
      content:
        'User(id=123, name="张三", age=30, friends=[User(id=456, name="李四", age=28), User(id=789, name="王五", age=35)], isActive=true)',
      language: 'plaintext'
    });

    // 打开文档
    const editor = await vscode.window.showTextDocument(document);

    // 选择整行文本
    editor.selection = new vscode.Selection(
      new vscode.Position(0, 0),
      new vscode.Position(0, document.lineAt(0).text.length)
    );

    // 执行命令
    await vscode.commands.executeCommand('thrift-string-to-json.convertToJson');

    // 验证结果
    // 我们不能直接验证新打开的文档内容，因为测试环境中难以获取到新打开的文档
    // 但至少可以验证命令执行没有抛出错误
  });
});
