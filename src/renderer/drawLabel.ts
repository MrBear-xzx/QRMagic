/** 绘制文本标签层 */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  qrSize: number,
  params: {
    labelText: string;
    labelColor: string;
    labelFontSize: number;
  }
): void {
  if (!params.labelText.trim()) return;

  const fontSize = params.labelFontSize;
  const qrY = (canvasSize - qrSize) / 2;
  const labelY = qrY + qrSize + fontSize * 2;

  ctx.fillStyle = params.labelColor;
  ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(params.labelText, canvasSize / 2, labelY);
}
