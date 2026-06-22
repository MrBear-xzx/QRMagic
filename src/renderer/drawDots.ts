import type { DotStyle, QRMatrix } from '@/types';

interface DrawDotsOptions {
  matrix: QRMatrix;
  matrixSize: number;
  dotSize: number;
  style: DotStyle;
  cornerRadius: number;
  circleRatio: number;
  sizeRatio: number;
  /** Finder 图案位置 */
  finderPositions: Array<{ startRow: number; endRow: number; startCol: number; endCol: number }>;
  /** 对准图案中心坐标列表 */
  alignmentCenters: number[];
  /** 码点在 Canvas 上的 X 偏移 */
  offsetX: number;
  /** 码点在 Canvas 上的 Y 偏移 */
  offsetY: number;
}

/** 查找 Finder 定位图案的位置 */
export function getFinderPositions(matrixSize: number): Array<{
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}> {
  const finderSize = 7;
  return [
    { startRow: 0, endRow: finderSize - 1, startCol: 0, endCol: finderSize - 1 },
    { startRow: 0, endRow: finderSize - 1, startCol: matrixSize - finderSize, endCol: matrixSize - 1 },
    { startRow: matrixSize - finderSize, endRow: matrixSize - 1, startCol: 0, endCol: finderSize - 1 },
  ];
}

/** 获取对准图案中心位置（QR 版本 ≥ 2 才有） */
export function getAlignmentCenters(matrixSize: number): number[] {
  // 根据 QR 版本推导对准图案位置表
  const version = (matrixSize - 17) / 4;
  if (version < 2) return [];
  // 简化：计算核心对准位置
  const centers: number[] = [6]; // 第一个总是在 6
  const step = version < 7 ? (matrixSize - 13) / (version - 1) : 0;
  if (step > 0) {
    for (let i = 1; i < version; i++) {
      centers.push(Math.round(6 + i * step));
    }
  }
  centers.push(matrixSize - 7); // 最后一个
  return [...new Set(centers)].sort((a, b) => a - b);
}

/** 判断是否在「结构图案」内（Finder/Timing/Alignment），必须用方块绘制以保扫描兼容 */
function isStructural(
  row: number,
  col: number,
  matrixSize: number,
  finderPositions: Array<{ startRow: number; endRow: number; startCol: number; endCol: number }>,
  alignmentCenters: number[]
): boolean {
  // Finder 图案
  if (
    finderPositions.some(
      (f) => row >= f.startRow && row <= f.endRow && col >= f.startCol && col <= f.endCol
    )
  ) return true;

  // 时序图案：row=6 或 col=6，跨越 Finder 之间的区域
  if (row === 6 && col >= 7 && col <= matrixSize - 8) return true;
  if (col === 6 && row >= 7 && row <= matrixSize - 8) return true;

  // 对准图案 5×5 区域
  for (const cy of alignmentCenters) {
    for (const cx of alignmentCenters) {
      if (
        row >= cy - 2 && row <= cy + 2 &&
        col >= cx - 2 && col <= cx + 2
      ) {
        // 排除与 Finder 重叠的对准图案
        const overlapsFinder = finderPositions.some(
          (f) => cy - 2 >= f.startRow && cy + 2 <= f.endRow && cx - 2 >= f.startCol && cx + 2 <= f.endCol
        );
        if (!overlapsFinder) return true;
      }
    }
  }

  return false;
}

/** 绘制码点层 */
export function drawDots(
  ctx: CanvasRenderingContext2D,
  fillStyle: string | CanvasGradient,
  options: DrawDotsOptions
): void {
  const { matrix, matrixSize, dotSize, style, cornerRadius, circleRatio, sizeRatio, finderPositions, alignmentCenters, offsetX, offsetY } = options;
  ctx.fillStyle = fillStyle;

  const rows = matrix.length;
  if (rows === 0) return;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < rows; col++) {
      if (!matrix[row][col]) continue;

      const x = offsetX + col * dotSize;
      const y = offsetY + row * dotSize;

      // 结构图案（Finder/Timing/Alignment）强制方块绘制，确保扫描兼容性
      if (isStructural(row, col, matrixSize, finderPositions, alignmentCenters)) {
        ctx.fillRect(x, y, dotSize, dotSize);
      } else {
        drawStyledDot(ctx, x, y, dotSize, style, cornerRadius, circleRatio, sizeRatio);
      }
    }
  }
}

/** 根据样式绘制码点 */
function drawStyledDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dotSize: number,
  style: DotStyle,
  cornerRadius: number,
  circleRatio: number,
  sizeRatio: number
): void {
  const actualSize = dotSize * sizeRatio;
  const offset = (dotSize - actualSize) / 2;
  const cx = x + offset;
  const cy = y + offset;

  switch (style) {
    case 'square':
      ctx.fillRect(cx, cy, actualSize, actualSize);
      break;

    case 'circle':
      drawCircle(ctx, cx, cy, actualSize, circleRatio);
      break;

    case 'rounded':
      drawRoundedRect(ctx, cx, cy, actualSize, cornerRadius);
      break;

  }
}

/** 绘制圆形码点 */
function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  ratio: number
): void {
  const radius = (size / 2) * ratio;
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
}

/** 绘制圆角矩形码点 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number
): void {
  const r = Math.min(radius, size / 2);
  ctx.beginPath();
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
  ctx.fill();
}
