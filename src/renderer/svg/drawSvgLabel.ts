/** 绘制 SVG 文本标签层 */
export function drawSvgLabel(
  canvasSize: number,
  qrSize: number,
  params: {
    labelText: string;
    labelColor: string;
    labelFontSize: number;
  },
): string {
  if (!params.labelText.trim()) return '';

  const fontSize = params.labelFontSize;
  const qrY = (canvasSize - qrSize) / 2;
  const labelY = qrY + qrSize + fontSize * 2;

  return `<text x="${canvasSize / 2}" y="${labelY}" fill="${params.labelColor}" font-size="${fontSize}" font-family="'PingFang SC', 'Microsoft YaHei', sans-serif" text-anchor="middle">${escapeXml(params.labelText)}</text>`;
}

/** 转义 XML 特殊字符 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
