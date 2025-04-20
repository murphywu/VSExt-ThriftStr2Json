# Thrift toString 转 JSON 插件

这个 VS Code 插件可以帮助你将 Thrift 对象的 toString() 输出转换为更易读的 JSON 格式。

## 功能特性

当你在 Thrift 项目中工作时，你可能会经常看到这样的输出：

```
User(id=123, name="张三", age=30, friends=[User(id=456, name="李四", age=28), User(id=789, name="王五", age=35)], isActive=true)
```

使用本插件，你可以轻松地将这种格式转换为易于阅读的 JSON：

```json
{
  "id": 123,
  "name": "张三",
  "age": 30,
  "friends": [
    {
      "id": 456,
      "name": "李四",
      "age": 28
    },
    {
      "id": 789,
      "name": "王五",
      "age": 35
    }
  ],
  "isActive": true
}
```

### 使用方法

1. 选择任意符合 Thrift toString 格式的文本（或者将光标放在该行任意位置并选中一部分文本）
2. 此时行末会出现一个"转换为 JSON"按钮
3. 点击按钮（或者悬停在该行上并点击悬停提示中的链接）
4. 一个新的编辑窗口将会打开，显示转换后的 JSON 文本

## 支持的格式

插件支持以下格式的转换：

- 基本的 Thrift 对象格式，如 `User(id=123, name="张三")`
- 带有嵌套对象的格式，如 `User(friend=Person(name="李四"))`
- 带有数组/列表的格式，如 `User(friends=[Friend(name="李四"), Friend(name="王五")])`
- 基本数据类型，如字符串、数字、布尔值等

## 需求

没有特殊的需求，插件可以直接在 VS Code 中使用。

## 已知问题

- 目前不支持含有非常复杂嵌套结构的 Thrift 对象
- 如果 toString 格式不符合标准，可能无法正确解析

## 版本历史

### 0.0.1

- 初始版本发布
- 支持基本的 Thrift toString 到 JSON 的转换功能

## 开发

该插件是基于 VS Code 扩展 API 开发的。如果你想要参与开发，可以按以下步骤操作：

1. 克隆代码库
2. 执行 `npm install` 安装依赖
3. 使用 VS Code 打开项目
4. 按 F5 开始调试

## 许可证

MIT
