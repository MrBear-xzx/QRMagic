import type { QRParams, ContentType } from '@/types';

/** 历史记录条目 */
export interface HistoryEntry {
  /** 唯一 ID */
  id: string;
  /** 完整 QR 参数快照（Logo 的 imageDataUrl 不存储） */
  params: QRParams;
  /** 内容摘要（用于列表展示，最多 40 字） */
  contentSummary: string;
  /** 内容类型 */
  contentType: ContentType;
  /** 记录时间戳 */
  timestamp: number;
}

const STORAGE_KEY = 'qrmagic_history';
const MAX_ENTRIES = 20;

/** 保存到历史记录 */
export function saveHistory(params: QRParams): void {
  const entries = loadHistory();
  const summary = makeContentSummary(params);
  if (!summary) return; // 空内容不记录

  const entry: HistoryEntry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    params: sanitizeParams(params),
    contentSummary: summary,
    contentType: params.content.type,
    timestamp: Date.now(),
  };

  entries.unshift(entry);

  // 保持最多 MAX_ENTRIES 条
  if (entries.length > MAX_ENTRIES) {
    entries.length = MAX_ENTRIES;
  }

  persistHistory(entries);
}

/** 读取全部历史记录 */
export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/** 删除单条记录 */
export function deleteHistory(id: string): void {
  const entries = loadHistory().filter((e) => e.id !== id);
  persistHistory(entries);
}

/** 清空全部记录 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** 格式化相对时间 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

/** 生成内容摘要 */
function makeContentSummary(params: QRParams): string {
  const { content } = params;
  let text = '';
  switch (content.type) {
    case 'text':
      text = content.text || '';
      break;
    case 'url':
      text = content.url || '';
      break;
    case 'phone':
      text = content.phone || '';
      break;
    case 'email':
      text = content.email || '';
      break;
    case 'wifi':
      text = content.wifiSsid || '';
      if (content.wifiPassword) text += ' (有密码)';
      break;
    case 'vcard':
      text = content.vcardName || '';
      if (content.vcardCompany) text += ` · ${content.vcardCompany}`;
      break;
  }
  return text.trim().substring(0, 40);
}

/** 移除 Logo 的 base64 数据，其他参数完整保留 */
function sanitizeParams(params: QRParams): QRParams {
  return {
    ...params,
    logo: {
      ...params.logo,
      imageDataUrl: null, // 不存储 base64，避免 localStorage 超限
      enabled: params.logo.enabled,
    },
  };
}

/** 写入 localStorage */
function persistHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage 满了或不可用，静默失败
    console.warn('历史记录写入失败，存储可能已满');
  }
}
