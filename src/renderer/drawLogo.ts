import type { LogoMaskShape } from '@/types';

interface DrawLogoOptions {
  imageDataUrl: string;
  /** Logo 在画布中的区域大小（px） */
  logoAreaSize: number;
  /** 画布大小 */
  canvasSize: number;
  maskShape: LogoMaskShape;
  maskPadding: number;
  maskColor: string;
}

/** 绘制 Logo 层 */
export async function drawLogo(
  ctx: CanvasRenderingContext2D,
  options: DrawLogoOptions
): Promise<void> {
  const { imageDataUrl, logoAreaSize, canvasSize, maskShape, maskPadding, maskColor } = options;

  if (logoAreaSize <= 0) return;

  // 计算 Logo 区域在画布中的位置
  const logoX = (canvasSize - logoAreaSize) / 2;
  const logoY = (canvasSize - logoAreaSize) / 2;
  const maskSize = logoAreaSize + maskPadding * 2;
  const maskX = logoX - maskPadding;
  const maskY = logoY - maskPadding;

  // 绘制遮罩背景
  if (maskPadding > 0) {
    ctx.fillStyle = maskColor;
    drawMaskShape(ctx, maskX, maskY, maskSize, maskShape);
  }

  // 加载并绘制图片
  try {
    const img = await loadImage(imageDataUrl);
    const { drawX, drawY, drawW, drawH } = calculateLogoFit(
      img.width,
      img.height,
      logoX,
      logoY,
      logoAreaSize
    );

    ctx.save();

    // 创建裁切区域
    ctx.beginPath();
    if (maskShape === 'circle') {
      const centerX = logoX + logoAreaSize / 2;
      const centerY = logoY + logoAreaSize / 2;
      ctx.arc(centerX, centerY, logoAreaSize / 2, 0, Math.PI * 2);
    } else {
      drawRoundedRectPath(ctx, logoX, logoY, logoAreaSize, 8);
    }
    ctx.clip();

    // 绘制 Logo 图片
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  } catch {
    console.error('Logo 图片加载失败');
  }
}

/** 加载图片 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** 计算 Logo 适配区域（contain 模式） */
function calculateLogoFit(
  imgW: number,
  imgH: number,
  targetX: number,
  targetY: number,
  targetSize: number
): { drawX: number; drawY: number; drawW: number; drawH: number } {
  const scale = Math.min(targetSize / imgW, targetSize / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const drawX = targetX + (targetSize - drawW) / 2;
  const drawY = targetY + (targetSize - drawH) / 2;
  return { drawX, drawY, drawW, drawH };
}

/** 绘制遮罩形状 */
function drawMaskShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: LogoMaskShape
): void {
  ctx.beginPath();
  if (shape === 'circle') {
    const center = x + size / 2;
    ctx.arc(center, center, size / 2, 0, Math.PI * 2);
  } else {
    drawRoundedRectPath(ctx, x, y, size, 8);
  }
  ctx.fill();
}

/** 圆角矩形 Path（不 fill） */
function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number
): void {
  const r = Math.min(radius, size / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.arcTo(x + size, y, x + size, y + r, r);
  ctx.lineTo(x + size, y + size - r);
  ctx.arcTo(x + size, y + size, x + size - r, y + size, r);
  ctx.lineTo(x + r, y + size);
  ctx.arcTo(x, y + size, x, y + size - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
