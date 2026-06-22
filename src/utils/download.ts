import type { QRParams } from '@/types';
import { buildQrData, encodeQRMatrix } from '@/encoder/qrEncoder';
import { renderQRCode, canvasToBlob } from '@/renderer';
import { svgrRenderQRCode, svgToBlob } from '@/renderer/svg';
import { saveHistory } from '@/utils/historyStorage';
import { useQRStore } from '@/store/useQRStore';

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

  const isSvg = params.export.format === 'svg';

  if (isSvg) {
    // SVG 路径：直接生成字符串 → Blob
    const svgString = svgrRenderQRCode({ matrix, params });
    const blob = svgToBlob(svgString);
    downloadBlob(blob, params.export.fileName, 'svg');
  } else {
    // PNG 路径：Canvas 渲染 → Blob
    const canvas = document.createElement('canvas');
    await renderQRCode({ canvas, matrix, params });
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, params.export.fileName, 'png');
  }

  // 自动保存历史记录
  saveHistory(params);
  useQRStore.getState().bumpHistoryVersion();
}

/** 触发浏览器下载 */
function downloadBlob(blob: Blob, fileName: string, ext: string): void {
  let finalName = fileName;
  const extWithDot = `.${ext}`;
  if (!finalName) {
    finalName = `QRMagic_${new Date().getTime()}${extWithDot}`;
  } else if (!finalName.endsWith(extWithDot)) {
    finalName = `${finalName}${extWithDot}`;
  }

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}
