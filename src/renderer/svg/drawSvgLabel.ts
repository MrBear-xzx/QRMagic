/** 估算 SVG 文本行数 */
export function measureSvgLabelLines(
  text: string,
  maxWidth: number,
  fontSize: number,
): number {
  if (!text.trim()) return 0;
  return wrapText(text, maxWidth, fontSize).length;
}

/** 绘制 SVG 文本标签层（支持自动换行） */
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
  const maxWidth = qrSize;
  const lineHeight = fontSize * 1.5;

  const lines = wrapText(params.labelText, maxWidth, fontSize);
  const startY = qrY + qrSize + lineHeight;

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${canvasSize / 2}" y="${startY + i * lineHeight}" text-anchor="middle">${escapeXml(line)}</tspan>`,
    )
    .join('\n');

  return `<text fill="${params.labelColor}" font-size="${fontSize}" font-family="'PingFang SC', 'Microsoft YaHei', sans-serif">\n${tspans}\n</text>`;
}

/** 按估算像素宽度拆分行 */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = [];
  let current = '';
  // 粗略估算：中文≈fontSize，ASCII≈fontSize*0.55
  const estimateWidth = (s: string) => {
    let w = 0;
    for (const ch of s) {
      w += /[一-鿿　-〿＀-￯]/.test(ch) ? fontSize : fontSize * 0.55;
    }
    return w;
  };

  for (const ch of text) {
    const testLine = current + ch;
    if (estimateWidth(testLine) > maxWidth && current.length > 0) {
      lines.push(current);
      current = ch;
    } else {
      current = testLine;
    }
  }
  if (current) lines.push(current);

  return lines.length > 0 ? lines : [text];
}

/** 转义 XML 特殊字符 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
