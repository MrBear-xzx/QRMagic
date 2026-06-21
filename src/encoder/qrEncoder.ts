import QRCode from 'qrcode';
import type { QRMatrix, ContentType, ErrorLevel } from '@/types';

/** 将内容参数编码为 QR 字符串 */
export function buildQrData(params: {
  type: ContentType;
  text?: string;
  url?: string;
  vcardName?: string;
  vcardPhone?: string;
  vcardEmail?: string;
  vcardCompany?: string;
  vcardTitle?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  wifiEncryption?: string;
  phone?: string;
  email?: string;
  emailSubject?: string;
  emailBody?: string;
}): string {
  switch (params.type) {
    case 'url':
      return formatUrl(params.url || '');
    case 'vcard':
      return buildVCard(params);
    case 'wifi':
      return buildWifi(params);
    case 'phone':
      return `TEL:${params.phone || ''}`;
    case 'email':
      return buildMailto(params);
    case 'text':
    default:
      return params.text || '';
  }
}

/** 格式化 URL：自动补全协议 */
function formatUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** 构建 vCard 字符串 */
function buildVCard(p: {
  vcardName?: string;
  vcardPhone?: string;
  vcardEmail?: string;
  vcardCompany?: string;
  vcardTitle?: string;
}): string {
  const parts = ['BEGIN:VCARD', 'VERSION:3.0'];
  if (p.vcardName) {
    parts.push(`FN:${escapeVCard(p.vcardName)}`);
  }
  if (p.vcardPhone) parts.push(`TEL:${escapeVCard(p.vcardPhone)}`);
  if (p.vcardEmail) parts.push(`EMAIL:${escapeVCard(p.vcardEmail)}`);
  if (p.vcardTitle) parts.push(`TITLE:${escapeVCard(p.vcardTitle)}`);
  if (p.vcardCompany) parts.push(`ORG:${escapeVCard(p.vcardCompany)}`);
  parts.push('END:VCARD');
  return parts.join('\n');
}

/** vCard 特殊字符转义（RFC 6350） */
function escapeVCard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

/** 构建 WiFi 连接字符串 */
function buildWifi(p: {
  wifiSsid?: string;
  wifiPassword?: string;
  wifiEncryption?: string;
}): string {
  const ssid = p.wifiSsid || '';
  const password = p.wifiPassword || '';
  const encryption = p.wifiEncryption || 'WPA';
  return `WIFI:T:${encryption};S:${escapeWifi(ssid)};P:${escapeWifi(password)};;`;
}

/** 转义 WiFi 字符串中的特殊字符 */
function escapeWifi(str: string): string {
  return str.replace(/[\\;,:]/g, '\\$&');
}

/** 构建 mailto 字符串 */
function buildMailto(p: {
  email?: string;
  emailSubject?: string;
  emailBody?: string;
}): string {
  const email = p.email || '';
  const params = new URLSearchParams();
  if (p.emailSubject) params.set('subject', p.emailSubject);
  if (p.emailBody) params.set('body', p.emailBody);
  const qs = params.toString();
  return qs ? `MAILTO:${email}?${qs}` : `MAILTO:${email}`;
}

/** 容错等级映射 */
const ERROR_LEVEL_MAP: Record<ErrorLevel, 'L' | 'M' | 'Q' | 'H'> = {
  L: 'L',
  M: 'M',
  Q: 'Q',
  H: 'H',
};

/** 将 QR 数据编码为矩阵 */
export async function encodeQRMatrix(
  data: string,
  errorLevel: ErrorLevel = 'M'
): Promise<QRMatrix> {
  if (!data.trim()) {
    return [];
  }

  try {
    // 显式使用 Byte 模式确保中文字符以 UTF-8 正确编码
    const bytes = new TextEncoder().encode(data);
    const qrData = QRCode.create([{ data: bytes, mode: 'byte' as const }], {
      errorCorrectionLevel: ERROR_LEVEL_MAP[errorLevel],
    });

    const size = qrData.modules.size;
    const matrix: QRMatrix = [];

    for (let row = 0; row < size; row++) {
      matrix[row] = [];
      for (let col = 0; col < size; col++) {
        // modules.get(row, col) 返回 true 表示暗色模块（码点）
        matrix[row][col] = !!qrData.modules.get(row, col);
      }
    }

    return matrix;
  } catch {
    console.error('QR 编码失败');
    return [];
  }
}
