import type { QRParams, QRMatrix } from '@/types';
import { getFinderPositions, getAlignmentCenters, drawDots } from './drawDots';
import { getForegroundColor } from './drawBackground';
import { drawLogo } from './drawLogo';
import { drawBorder } from './drawBorder';
import { drawLabel } from './drawLabel';

interface RenderOptions {
  canvas: HTMLCanvasElement;
  matrix: QRMatrix;
  params: QRParams;
}

/** 渲染调度：按 Layer 1→5 顺序绘制 */
export async function renderQRCode(options: RenderOptions): Promise<void> {
  const { canvas, matrix, params } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rows = matrix.length;
  if (rows === 0) return;

  // QR 码规范要求 4 模块静区（Quiet Zone）
  const QUIET_MODULES = 4;
  const totalModules = rows + QUIET_MODULES * 2;

  // 计算尺寸
  const exportSize = params.export.size;
  const margin = Math.min(params.export.margin, exportSize / 2 - 1);
  const qrAreaSize = Math.max(1, exportSize - margin * 2);
  const dotSize = qrAreaSize / totalModules;
  const qrTotalSize = dotSize * totalModules;
  // 码点在 Canvas 上的起始偏移
  const offsetX = margin + QUIET_MODULES * dotSize;
  const offsetY = margin + QUIET_MODULES * dotSize;

  // 标签高度
  const hasLabel = params.border.labelText.trim().length > 0;
  const labelHeight = hasLabel ? params.border.labelFontSize * 3 : 0;
  const canvasHeight = exportSize + labelHeight;

  // 设置 Canvas 尺寸
  canvas.width = exportSize;
  canvas.height = canvasHeight;

  // 【Layer 1】背景（覆盖整个扩展的画布）
  ctx.fillStyle = params.color.background;
  ctx.fillRect(0, 0, exportSize, canvasHeight);

  // 【Layer 2】码点
  const fillStyle = getForegroundColor(ctx, exportSize, params.color);
  const finderPositions = getFinderPositions(rows);
  const alignmentCenters = getAlignmentCenters(rows);
  drawDots(ctx, fillStyle, {
    matrix,
    matrixSize: rows,
    dotSize,
    style: params.dot.style,
    cornerRadius: params.dot.cornerRadius,
    circleRatio: params.dot.circleRatio,
    sizeRatio: params.dot.sizeRatio,
    finderPositions,
    alignmentCenters,
    offsetX,
    offsetY,
  });

  // 【Layer 3】Logo
  if (params.logo.enabled && params.logo.imageDataUrl) {
    const logoAreaSize = qrTotalSize * params.logo.sizeRatio;
    await drawLogo(ctx, {
      imageDataUrl: params.logo.imageDataUrl,
      logoAreaSize,
      canvasSize: exportSize,
      maskShape: params.logo.maskShape,
      maskPadding: params.logo.maskPadding,
      maskColor: params.logo.maskColor,
    });
  }

  // 【Layer 5】边框装饰
  drawBorder(ctx, exportSize, qrTotalSize, params.border);

  // 【Layer 4】文本标签
  drawLabel(ctx, exportSize, qrTotalSize, {
    labelText: params.border.labelText,
    labelColor: params.border.labelColor,
    labelFontSize: params.border.labelFontSize,
  });
}

/** 导出为 PNG Blob */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas 转 Blob 失败'));
    }, 'image/png');
  });
}

/** 导出为 Data URL */
export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}
