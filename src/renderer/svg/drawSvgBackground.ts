/** 绘制 SVG 背景层（始终纯色） */
export function drawSvgBackground(
  width: number,
  height: number,
  backgroundColor: string,
): string {
  return `<rect width="${width}" height="${height}" fill="${backgroundColor}"/>`;
}
