/** 估算文本行数（用于计算标签高度） */
export function measureLabelLines(
  text: string,
  maxWidth: number,
  fontSize: number,
): number {
  if (!text.trim()) return 0;
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return 1;
  ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  return wrapText(ctx, text, maxWidth).length;
}

/** 绘制文本标签层（支持自动换行） */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  qrSize: number,
  params: {
    labelText: string;
    labelColor: string;
    labelFontSize: number;
  },
): void {
  if (!params.labelText.trim()) return;

  const fontSize = params.labelFontSize;
  const qrY = (canvasSize - qrSize) / 2;
  const maxWidth = qrSize;
  const lineHeight = fontSize * 1.5;

  ctx.fillStyle = params.labelColor;
  ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = wrapText(ctx, params.labelText, maxWidth);
  const startY = qrY + qrSize + lineHeight;

  lines.forEach((line, i) => {
    ctx.fillText(line, canvasSize / 2, startY + i * lineHeight);
  });
}

/** 按像素宽度拆分行 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let current = '';

  for (const ch of text) {
    const testLine = current + ch;
    if (ctx.measureText(testLine).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = ch;
    } else {
      current = testLine;
    }
  }
  if (current) lines.push(current);

  return lines.length > 0 ? lines : [text];
}
