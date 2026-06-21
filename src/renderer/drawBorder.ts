import type { BorderParams } from '@/types';

/** 绘制边框装饰层 */
export function drawBorder(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  qrSize: number,
  params: BorderParams
): void {
  if (params.style === 'none') return;

  const borderWidth = params.width;
  const qrX = (canvasSize - qrSize) / 2;
  const qrY = (canvasSize - qrSize) / 2;

  ctx.beginPath();
  ctx.strokeStyle = params.color;
  ctx.lineWidth = borderWidth;

  if (params.borderRadius > 0) {
    const r = params.borderRadius;
    const x = qrX - borderWidth / 2;
    const y = qrY - borderWidth / 2;
    const w = qrSize + borderWidth;
    const h = qrSize + borderWidth;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.strokeRect(
      qrX - borderWidth / 2,
      qrY - borderWidth / 2,
      qrSize + borderWidth,
      qrSize + borderWidth
    );
  }
}
