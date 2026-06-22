import type { BorderParams } from '@/types';

/** 绘制 SVG 边框装饰层 */
export function drawSvgBorder(
  canvasSize: number,
  qrSize: number,
  params: BorderParams,
): string {
  if (params.style === 'none') return '';

  const borderWidth = params.width;
  const qrX = (canvasSize - qrSize) / 2;
  const qrY = (canvasSize - qrSize) / 2;

  return `<rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" fill="none" stroke="${params.color}" stroke-width="${borderWidth}" rx="${params.borderRadius}"/>`;
}
