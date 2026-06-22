import JSZip from 'jszip';
import type { QRParams } from '@/types';
import type { CsvRow } from './csvParser';
import { buildQrData, encodeQRMatrix } from '@/encoder/qrEncoder';
import { renderQRCode, canvasToBlob } from '@/renderer';
import { svgrRenderQRCode, svgToBlob } from '@/renderer/svg';

/** 批量生成进度回调 */
export type BatchProgressCallback = (current: number, total: number) => void;

/**
 * 批量生成二维码 ZIP
 * @param rows CSV 解析后的行数据
 * @param params 当前 QR 参数
 * @param onProgress 进度回调
 * @param signal 取消信号
 * @returns ZIP Blob
 */
export async function generateBatch(
  rows: CsvRow[],
  params: QRParams,
  onProgress: BatchProgressCallback,
  signal?: AbortSignal,
): Promise<Blob> {
  const zip = new JSZip();
  const isSvg = params.export.format === 'svg';
  const total = rows.length;

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) {
      throw new DOMException('用户取消批量生成', 'AbortError');
    }

    const row = rows[i];
    const rowNum = i + 1;

    try {
      // 1. 编码
      const data = buildQrData({ type: row.type, ...buildContentParams(row) });
      if (!data.trim()) {
        console.warn(`第 ${rowNum} 行编码内容为空，已跳过`);
        continue;
      }

      const matrix = await encodeQRMatrix(data, params.errorCorrection.level);
      if (matrix.length === 0) {
        console.warn(`第 ${rowNum} 行 QR 编码失败，已跳过`);
        continue;
      }

      // 2. 渲染
      const blob = isSvg
        ? renderSvgBlob(matrix, params)
        : await renderPngBlob(matrix, params);

      // 3. 加入 ZIP
      const ext = isSvg ? 'svg' : 'png';
      const label = row.label || `item${rowNum}`;
      const fileName = `${String(rowNum).padStart(String(total).length, '0')}_${label}.${ext}`;
      zip.file(fileName, blob);
    } catch (err) {
      console.warn(`第 ${rowNum} 行生成失败：${err instanceof Error ? err.message : '未知错误'}`);
    }

    // 4. 进度
    onProgress(rowNum, total);
  }

  return zip.generateAsync({ type: 'blob' });
}

/** PNG 渲染（离屏 Canvas） */
async function renderPngBlob(
  matrix: boolean[][],
  params: QRParams,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderQRCode({ canvas, matrix, params });
  return canvasToBlob(canvas);
}

/** SVG 渲染（字符串 → Blob） */
function renderSvgBlob(
  matrix: boolean[][],
  params: QRParams,
): Blob {
  const svgString = svgrRenderQRCode({ matrix, params });
  return svgToBlob(svgString);
}

/** 根据行数据构建内容参数 */
function buildContentParams(row: CsvRow): Record<string, string | undefined> {
  switch (row.type) {
    case 'url':
      return { url: row.content, text: row.content };
    case 'wifi':
      return parseWifiContent(row.content);
    case 'vcard':
      return { vcardName: row.content, text: row.content };
    case 'phone':
      return { phone: row.content, text: row.content };
    case 'email':
      return parseEmailContent(row.content);
    case 'text':
    default:
      return { text: row.content };
  }
}

/** 解析 WiFi 内容（S:SSID;P:密码 或 仅 SSID） */
function parseWifiContent(content: string): Record<string, string | undefined> {
  // 尝试解析标准 WiFi 格式：WIFI:T:WPA;S:xxx;P:xxx;;
  const wifiMatch = content.match(/^WIFI:T:([^;]*);S:([^;]*);P:([^;]*);/i);
  if (wifiMatch) {
    return {
      wifiEncryption: wifiMatch[1] || 'WPA',
      wifiSsid: unescapeWifi(wifiMatch[2]),
      wifiPassword: unescapeWifi(wifiMatch[3] || ''),
      text: content,
    };
  }
  // 简单格式：直接作为 SSID，无密码
  // 或 S:xxx;P:xxx 格式
  const ssidMatch = content.match(/S:([^;]+)/i);
  const pwdMatch = content.match(/P:([^;]+)/i);
  return {
    wifiSsid: ssidMatch ? unescapeWifi(ssidMatch[1]) : content,
    wifiPassword: pwdMatch ? unescapeWifi(pwdMatch[1]) : '',
    wifiEncryption: 'WPA',
    text: content,
  };
}

function unescapeWifi(str: string): string {
  return str.replace(/\\(.)/g, '$1');
}

/** 解析邮箱内容 */
function parseEmailContent(content: string): Record<string, string | undefined> {
  if (content.toUpperCase().startsWith('MAILTO:')) {
    return { email: content, text: content };
  }
  return { email: content, text: content };
}
