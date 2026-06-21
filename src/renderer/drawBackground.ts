import type { ColorParams, GradientDirection, QRMatrix } from '@/types';

/** 绘制背景层（始终纯色填充） */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  color: ColorParams
): void {
  ctx.fillStyle = color.background;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
}

/** 根据颜色参数创建渐变 */
function createGradient(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: ColorParams
): CanvasGradient | null {
  if (color.gradientType === 'none') return null;

  const c1 = color.gradientColor1 || color.foreground;
  const c2 = color.gradientColor2 || color.foreground;

  if (color.gradientType === 'linear') {
    const { x0, y0, x1, y1 } = getLinearCoords(size, color.gradientDirection);
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    return gradient;
  }

  if (color.gradientType === 'radial') {
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.7);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    return gradient;
  }

  return null;
}

/** 获取线性渐变坐标 */
function getLinearCoords(
  size: number,
  direction: GradientDirection
): { x0: number; y0: number; x1: number; y1: number } {
  switch (direction) {
    case 'horizontal':
      return { x0: 0, y0: 0, x1: size, y1: 0 };
    case 'vertical':
      return { x0: 0, y0: 0, x1: 0, y1: size };
    case 'anti-diagonal':
      return { x0: size, y0: 0, x1: 0, y1: size };
    case 'diagonal':
    default:
      return { x0: 0, y0: 0, x1: size, y1: size };
  }
}

/** 获取码点的前景色 */
export function getForegroundColor(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  color: ColorParams
): string | CanvasGradient {
  const gradient = createGradient(ctx, canvasSize, color);
  return gradient || color.foreground;
}
