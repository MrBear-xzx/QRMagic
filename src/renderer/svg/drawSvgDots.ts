import type { DotStyle, QRMatrix, ColorParams } from '@/types';
import { getFinderPositions, getAlignmentCenters } from '@/renderer/drawDots';


interface DrawSvgDotsOptions {
  matrix: QRMatrix;
  matrixSize: number;
  dotSize: number;
  style: DotStyle;
  cornerRadius: number;
  circleRatio: number;
  sizeRatio: number;
  offsetX: number;
  offsetY: number;
  color: ColorParams;
  canvasSize: number;
}

/** 判断是否在结构图案内（Finder/Timing/Alignment），必须用方块绘制 */
function isStructural(
  row: number,
  col: number,
  matrixSize: number,
  finderPositions: ReturnType<typeof getFinderPositions>,
  alignmentCenters: number[],
): boolean {
  // Finder 图案 7×7 区域
  if (
    finderPositions.some(
      (f) => row >= f.startRow && row <= f.endRow && col >= f.startCol && col <= f.endCol,
    )
  )
    return true;

  // 时序图案：row=6 或 col=6
  if (row === 6 && col >= 7 && col <= matrixSize - 8) return true;
  if (col === 6 && row >= 7 && row <= matrixSize - 8) return true;

  // 对准图案 5×5 区域
  for (const cy of alignmentCenters) {
    for (const cx of alignmentCenters) {
      if (row >= cy - 2 && row <= cy + 2 && col >= cx - 2 && col <= cx + 2) {
        const overlapsFinder = finderPositions.some(
          (f) =>
            cy - 2 >= f.startRow &&
            cy + 2 <= f.endRow &&
            cx - 2 >= f.startCol &&
            cx + 2 <= f.endCol,
        );
        if (!overlapsFinder) return true;
      }
    }
  }

  return false;
}

/** 生成 SVG 渐变 defs（使用 userSpaceOnUse，与 Canvas 行为一致：全画布渐变 → 每个码点采样局部颜色） */
function buildGradientDefs(color: ColorParams, size: number): string {
  if (color.gradientType === 'none') return '';

  const c1 = color.gradientColor1 || color.foreground;
  const c2 = color.gradientColor2 || color.foreground;

  if (color.gradientType === 'linear') {
    const { x0, y0, x1, y1 } = getLinearCoords(size, color.gradientDirection);
    return `<linearGradient id="dot-gradient" gradientUnits="userSpaceOnUse" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient>`;
  }

  if (color.gradientType === 'radial') {
    const center = size / 2;
    return `<radialGradient id="dot-gradient" gradientUnits="userSpaceOnUse" cx="${center}" cy="${center}" r="${size * 0.7}" fx="${center}" fy="${center}"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></radialGradient>`;
  }

  return '';
}

/** 获取线性渐变坐标（与 Canvas createLinearGradient 一致） */
function getLinearCoords(
  size: number,
  direction: string,
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

/** 绘制 SVG 码点层 */
export function drawSvgDots(options: DrawSvgDotsOptions): { dots: string; defs: string } {
  const {
    matrix,
    matrixSize,
    dotSize,
    style,
    cornerRadius,
    circleRatio,
    sizeRatio,
    offsetX,
    offsetY,
    color,
    canvasSize,
  } = options;

  const useGradient = color.gradientType !== 'none';
  const fillAttr = useGradient ? 'url(#dot-gradient)' : color.foreground;

  const finderPositions = getFinderPositions(matrixSize);
  const alignmentCenters = getAlignmentCenters(matrixSize);

  const elements: string[] = [];
  const rows = matrix.length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < rows; col++) {
      if (!matrix[row][col]) continue;

      const x = offsetX + col * dotSize;
      const y = offsetY + row * dotSize;

      // 结构图案强制方块
      if (isStructural(row, col, matrixSize, finderPositions, alignmentCenters)) {
        elements.push(`<rect x="${x}" y="${y}" width="${dotSize}" height="${dotSize}" fill="${fillAttr}"/>`);
        continue;
      }

      const actualSize = dotSize * sizeRatio;
      const offset = (dotSize - actualSize) / 2;
      const cx = x + offset;
      const cy = y + offset;

      switch (style) {
        case 'square':
          elements.push(`<rect x="${cx}" y="${cy}" width="${actualSize}" height="${actualSize}" fill="${fillAttr}"/>`);
          break;
        case 'circle': {
          const radius = (actualSize / 2) * circleRatio;
          const centerX = cx + actualSize / 2;
          const centerY = cy + actualSize / 2;
          elements.push(`<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${fillAttr}"/>`);
          break;
        }
        case 'rounded':
          elements.push(`<rect x="${cx}" y="${cy}" width="${actualSize}" height="${actualSize}" rx="${cornerRadius}" fill="${fillAttr}"/>`);
          break;
      }
    }
  }

  return {
    dots: elements.join('\n'),
    defs: buildGradientDefs(color, canvasSize),
  };
}
