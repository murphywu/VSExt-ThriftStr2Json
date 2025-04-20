/**
 * Thrift对象转JSON转换器
 * 将thrift对象的toString输出转换为更易读的JSON格式
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 将thrift对象的toString输出转换为JSON格式
 *
 * @param options 转换选项
 * @returns 解析后的JSON对象
 */
export function parseThriftToJson(options: {
  inputText?: string;
  inputFile?: string;
  outputFile?: string;
  includeType?: boolean;
}): any {
  const { inputText, inputFile, outputFile, includeType = true } = options;

  // 获取输入内容
  let content: string;
  if (!inputText && inputFile) {
    console.log(`正在读取文件: ${inputFile}`);
    content = fs.readFileSync(inputFile, 'utf-8').trim();
  } else if (inputText) {
    content = inputText.trim();
  } else {
    throw new Error('必须提供inputText或inputFile');
  }

  // 解析Thrift对象
  const result = parseThriftObject(content, includeType);

  // 输出结果
  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`转换完成，已写入文件: ${outputFile}`);
  }

  return result;
}

/**
 * 解析Thrift对象的toString输出
 *
 * @param text Thrift对象的toString输出文本
 * @param includeType 是否在输出中包含类型信息
 * @returns 解析后的对象（可以转为JSON）
 */
export function parseThriftObject(text: string, includeType = true): any {
  // 检查是否是空值
  if (text === 'null' || text === 'None') {
    return null;
  }

  // 检查是否是基本类型
  if (isPrimitive(text)) {
    return parsePrimitive(text);
  }

  // 检查是否是列表
  if (text.startsWith('[') && text.endsWith(']')) {
    return parseList(text, includeType);
  }

  // 检查是否是Map或JSON对象
  if (text.startsWith('{') && text.endsWith('}')) {
    return parseMapOrJson(text, includeType);
  }

  // 处理Thrift对象
  const match = text.match(/([A-Za-z0-9_]+)\((.*)\)/);
  if (match) {
    const objType = match[1];
    const content = match[2];
    return parseThriftFields(objType, content, includeType);
  }

  // 如果不是上述任何类型，则作为字符串返回
  return text;
}

/**
 * 判断是否是基本类型
 *
 * @param text 文本
 * @returns 是否是基本类型
 */
function isPrimitive(text: string): boolean {
  // 检查是否是数字
  if (/^-?\d+(\.\d+)?$/.test(text)) {
    return true;
  }

  // 检查是否是布尔值
  if (text.toLowerCase() === 'true' || text.toLowerCase() === 'false') {
    return true;
  }

  // 检查是否是带引号的字符串
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return true;
  }

  return false;
}

/**
 * 解析基本类型
 *
 * @param text 文本
 * @returns 解析后的值
 */
function parsePrimitive(text: string): any {
  // 解析数字
  if (/^-?\d+$/.test(text)) {
    return parseInt(text, 10);
  }
  if (/^-?\d+\.\d+$/.test(text)) {
    return parseFloat(text);
  }

  // 解析布尔值
  if (text.toLowerCase() === 'true') {
    return true;
  }
  if (text.toLowerCase() === 'false') {
    return false;
  }

  // 解析带引号的字符串
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }

  // 其他情况返回原始文本
  return text;
}

/**
 * 解析列表
 *
 * @param text 列表文本
 * @param includeType 是否包含类型信息
 * @returns 解析后的列表
 */
function parseList(text: string, includeType = true): any[] {
  if (text === '[]') {
    return [];
  }

  // 去掉方括号
  const content = text.slice(1, -1).trim();

  // 分割列表元素
  const elements = splitElements(content);

  // 解析每个元素
  const result: any[] = [];
  for (const element of elements) {
    result.push(parseThriftObject(element, includeType));
  }

  return result;
}

/**
 * 解析Map或JSON对象
 *
 * @param text Map或JSON文本
 * @param includeType 是否包含类型信息
 * @returns 解析后的对象
 */
function parseMapOrJson(text: string, includeType = true): any {
  if (text === '{}') {
    return {};
  }

  // 尝试直接解析为JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    // 如果直接解析失败，尝试手动解析
    // 去掉花括号
    const content = text.slice(1, -1).trim();

    // 分割字段
    const pairs = splitElements(content);

    // 解析每个键值对
    const result: any = {};
    for (const pair of pairs) {
      if (pair.includes(':')) {
        const [key, value] = splitKeyValue(pair);
        const keyTrimmed = key.trim();

        // 如果键带引号，去掉引号
        const finalKey =
          (keyTrimmed.startsWith('"') && keyTrimmed.endsWith('"')) ||
          (keyTrimmed.startsWith("'") && keyTrimmed.endsWith("'"))
            ? keyTrimmed.slice(1, -1)
            : keyTrimmed;

        result[finalKey] = parseThriftObject(value, includeType);
      }
    }

    return result;
  }
}

/**
 * 解析Thrift对象的字段
 *
 * @param objType 对象类型名
 * @param content 对象内容
 * @param includeType 是否包含类型信息
 * @returns 解析后的对象
 */
function parseThriftFields(objType: string, content: string, includeType = true): any {
  const result: any = {};
  if (includeType) {
    result['_type'] = objType;
  }

  // 分割字段
  const fields = splitElements(content);

  // 解析每个字段
  for (const field of fields) {
    if (field.includes(':')) {
      const [key, value] = splitKeyValue(field, ':');
      const keyTrimmed = key.trim();
      result[keyTrimmed] = parseThriftObject(value, includeType);
    }
  }

  return result;
}

/**
 * 分割元素，考虑嵌套结构
 *
 * @param text 要分割的文本
 * @returns 分割后的元素列表
 */
function splitElements(text: string): string[] {
  const elements: string[] = [];
  let current = '';
  let depth = 0;
  let inQuotes = false;
  let escapeNext = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 处理引号和转义字符
    if (!escapeNext && char === '\\') {
      escapeNext = true;
      current += char;
      continue;
    }

    if (!escapeNext && (char === '"' || char === "'")) {
      inQuotes = !inQuotes;
    } else {
      escapeNext = false;
    }

    // 只有在不在引号内时才计算括号深度
    if (!inQuotes) {
      if (char === '(' || char === '[' || char === '{') {
        depth++;
      } else if (char === ')' || char === ']' || char === '}') {
        depth--;
      }
    }

    current += char;

    // 当深度为0且遇到逗号时，我们找到了一个完整的元素
    if (depth === 0 && !inQuotes && char === ',') {
      elements.push(current.slice(0, -1).trim());
      current = '';
    }
  }

  // 添加最后一个元素
  if (current.trim()) {
    elements.push(current.trim());
  }

  return elements;
}

/**
 * 分割键值对
 *
 * @param text 包含键值对的文本
 * @param separator 分隔符，默认为':'
 * @returns [key, value] 元组
 */
function splitKeyValue(text: string, separator = ':'): [string, string] {
  // 查找第一个非嵌套的分隔符
  let separatorIndex = -1;
  let depth = 0;
  let inQuotes = false;
  let escapeNext = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 处理引号和转义字符
    if (!escapeNext && char === '\\') {
      escapeNext = true;
      continue;
    }

    if (!escapeNext && (char === '"' || char === "'")) {
      inQuotes = !inQuotes;
    } else {
      escapeNext = false;
    }

    // 只有在不在引号内时才计算括号深度
    if (!inQuotes) {
      if (char === '(' || char === '[' || char === '{') {
        depth++;
      } else if (char === ')' || char === ']' || char === '}') {
        depth--;
      } else if (char === separator && depth === 0 && separatorIndex === -1) {
        separatorIndex = i;
      }
    }
  }

  if (separatorIndex !== -1) {
    const key = text.slice(0, separatorIndex).trim();
    const value = text.slice(separatorIndex + 1).trim();
    return [key, value];
  } else {
    return [text, ''];
  }
}

/**
 * 命令行入口函数
 */
export function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      '用法: node thriftToJsonConverter.js <input_file> [-o <output_file>] [-t|--include-type] [-n|--no-type]'
    );
    process.exit(1);
  }

  const inputFile = args[0];
  let outputFile: string | undefined;
  let includeType = true;

  // 解析命令行参数
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '-o' || args[i] === '--output') {
      if (i + 1 < args.length) {
        outputFile = args[i + 1];
        i++;
      }
    } else if (args[i] === '-t' || args[i] === '--include-type') {
      includeType = true;
    } else if (args[i] === '-n' || args[i] === '--no-type') {
      includeType = false;
    }
  }

  // 如果没有指定输出文件，使用默认文件名
  if (!outputFile) {
    const baseName = path.basename(inputFile, path.extname(inputFile));
    outputFile = `${baseName}.json`;
  }

  parseThriftToJson({
    inputFile,
    outputFile,
    includeType
  });
}

// 如果作为脚本直接运行
if (require.main === module) {
  main();
}
