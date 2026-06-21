import type { QRParams } from '@/types';
import { buildQrData, encodeQRMatrix } from '@/encoder/qrEncoder';
import { renderQRCode, canvasToBlob } from '@/renderer';

/** 下载二维码 */
export async function downloadQRCode(params: QRParams): Promise<void> {
  const data = buildQrData(params.content);
  if (!data.trim()) {
    throw new Error('内容为空，无法生成二维码');
  }

  const matrix = await encodeQRMatrix(data, params.errorCorrection.level);
  if (matrix.length === 0) {
    throw new Error('QR 编码失败：内容过长或包含不支持的字符');
  }

  // 创建离屏 Canvas 渲染
  const canvas = document.createElement('canvas');
  await renderQRCode({ canvas, matrix, params });

  // 生成 Blob
  const blob = await canvasToBlob(canvas);

  // 确保文件名有 .png 扩展名
  let fileName = params.export.fileName;
  if (!fileName) {
    fileName = `QRMagic_${new Date().getTime()}.png`;
  } else if (!fileName.endsWith('.png')) {
    fileName = `${fileName}.png`;
  }

  // 安全的 Blob URL 管理
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}
