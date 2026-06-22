import type { ContentType } from '@/types';

/** 解析后的一行 CSV 数据 */
export interface CsvRow {
  /** 序号（从 1 开始） */
  index: number;
  /** 内容类型 */
  type: ContentType;
  /** 原始内容 */
  content: string;
  /** 简短的显示标签（用于文件名和预览） */
  label: string;
}

/** CSV 解析结果 */
export interface CsvParseResult {
  rows: CsvRow[];
  /** 被截断的行数 */
  truncated: number;
  /** 警告信息 */
  warnings: string[];
}

const MAX_ROWS = 200;

/**
 * 解析 CSV 文件
 * - 第一行为标题行（匹配 "类型,内容" 不区分大小写）自动跳过
 * - 空白行跳过
 * - 第二列未填写时智能识别类型
 */
export function parseCsv(file: File): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        resolve(parseCsvText(text));
      } catch (e) {
        reject(new Error(`CSV 解析失败：${e instanceof Error ? e.message : '未知错误'}`));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file, 'UTF-8');
  });
}

/** 解析 CSV 文本内容 */
function parseCsvText(text: string): CsvParseResult {
  const warnings: string[] = [];

  // 去除 BOM 头
  const clean = text.replace(/^﻿/, '');

  // 按行分割（支持 CRLF / LF）
  const lines = clean.split(/\r?\n/);
  let startIndex = 0;

  // 自动跳过标题行
  if (lines.length > 0 && isHeaderRow(lines[0])) {
    startIndex = 1;
  }

  const rows: CsvRow[] = [];
  let count = 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 跳过空白行

    const parsed = parseLine(line);
    if (!parsed) continue;

    const { rawType, content } = parsed;

    if (!content.trim()) {
      warnings.push(`第 ${i + 1} 行：内容为空，已跳过`);
      continue;
    }

    count++;
    if (count > MAX_ROWS) {
      return { rows, truncated: lines.length - i, warnings };
    }

    const type = rawType.trim()
      ? normalizeType(rawType.trim())
      : smartDetect(content);

    rows.push({
      index: count,
      type,
      content: content.trim(),
      label: makeLabel(content.trim()),
    });
  }

  return { rows, truncated: 0, warnings };
}

/** 解析一行 CSV（简单逗号分割，支持引号包裹） */
function parseLine(line: string): { rawType: string; content: string } | null {
  // 简单情况：不含引号
  if (!line.includes('"')) {
    const parts = line.split(',');
    if (parts.length < 2) return null;
    return { rawType: parts[0], content: parts.slice(1).join(',') };
  }

  // 含引号的情况
  const result = splitCsvLine(line);
  if (result.length < 2) return null;
  return { rawType: result[0], content: result.slice(1).join(',') };
}

/** 简单的 CSV 行分割（处理引号转义） */
function splitCsvLine(line: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());
  return parts;
}

/** 判断是否为标题行 */
function isHeaderRow(line: string): boolean {
  const lowered = line.toLowerCase().replace(/["'\s]/g, '');
  return lowered === '类型,内容' || lowered === 'type,content'
    || lowered === 'type,value' || lowered === '类型,值';
}

/** 规范化类型字符串 */
function normalizeType(raw: string): ContentType {
  const lowered = raw.toLowerCase().trim();
  const map: Record<string, ContentType> = {
    text: 'text', '文本': 'text',
    url: 'url', '网址': 'url', '链接': 'url',
    wifi: 'wifi',
    vcard: 'vcard', '名片': 'vcard',
    phone: 'phone', '电话': 'phone', '手机': 'phone',
    email: 'email', '邮箱': 'email', '邮件': 'email',
  };
  return map[lowered] || 'text';
}

/** 智能识别内容类型（类型列未填写时） */
function smartDetect(content: string): ContentType {
  const trimmed = content.trim();

  if (/^https?:\/\//i.test(trimmed)) return 'url';
  if (/^MAILTO:/i.test(trimmed)) return 'email';
  if (/^WIFI:/i.test(trimmed)) return 'wifi';
  if (/^TEL:/i.test(trimmed)) return 'phone';
  if (/^BEGIN:VCARD/i.test(trimmed)) return 'vcard';
  // 邮箱格式检测
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'email';
  // 纯数字（含短横、加号）→ 电话
  if (/^[\d\-\s\+\(\)]{6,}$/.test(trimmed)) return 'phone';

  return 'text';
}

/** 生成简短标签（用于文件名） */
function makeLabel(content: string): string {
  return content
    .replace(/^https?:\/\//i, '')
    .replace(/[<>:"/\\|?*\n\r\t]/g, '')
    .substring(0, 20);
}
