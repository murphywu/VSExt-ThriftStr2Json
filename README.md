# Thrift toString 转 JSON 插件

这个 VS Code 插件可以帮助你将日志中 Thrift 对象的 toString() 输出转换为更易读的 JSON 格式。

## 功能特性

当你在查看日志文件时，你可能会经常看到这样的输出：

```
TypeA(fileda:4, filedb:TypeB(filedc:"bbb")), discount:Discount(filedm:"dddd"), goods:[TypeC(filede:"ccc", filedf:32)]
```

使用本插件，你可以轻松地将这种格式转换为易于阅读的 JSON：

```json
{
  "_type": "TypeA",
  "fileda": 4,
  "filedb": {
    "_type": "TypeB",
    "filedc": "bbb"
  }
}



### 使用方法

1. 鼠标选中要转换的对象，比如这个例子中的`TypeA`
2. 点击鼠标右键，在弹出的菜单中选择点击【转换为 Json】
3. 转换成功后，会在新的编辑窗口中展示转换后的 json

使用示例：

## 版本历史

### 0.0.1

- 初始版本发布
- 支持基本的 Thrift toString 到 JSON 的转换功能

## 许可证

MIT
```
