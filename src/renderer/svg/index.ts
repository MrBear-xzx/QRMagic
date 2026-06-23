import type { QRParams, QRMatrix } from '@/types';
import { drawSvgBackground } from './drawSvgBackground';
import { drawSvgDots } from './drawSvgDots';
import { drawSvgLogo } from './drawSvgLogo';
import { drawSvgBorder } from './drawSvgBorder';
import { drawSvgLabel, measureSvgLabelLines } from './drawSvgLabel';

interface SvgrRenderOptions {
  matrix: QRMatrix;
  params: QRParams;
}

/** SVG 渲染调度：按 Layer 1→5 顺序生成 SVG 字符串 */
export function svgrRenderQRCode(options: SvgrRenderOptions): string {
  const { matrix, params } = options;

  const rows = matrix.length;
  if (rows === 0) throw new Error('矩阵为空，无法渲染 SVG');

  // 静区
  const QUIET_MODULES = 4;
  const totalModules = rows + QUIET_MODULES * 2;

  // 尺寸计算
  const exportSize = params.export.size;
  const margin = Math.min(params.export.margin, exportSize / 2 - 1);
  const qrAreaSize = Math.max(1, exportSize - margin * 2);
  const dotSize = qrAreaSize / totalModules;
  const qrTotalSize = dotSize * totalModules;
  const offsetX = margin + QUIET_MODULES * dotSize;
  const offsetY = margin + QUIET_MODULES * dotSize;

  // 标签高度（根据文本实际行数计算）
  const hasLabel = params.border.labelText.trim().length > 0;
  const labelLines = hasLabel
    ? measureSvgLabelLines(params.border.labelText, qrTotalSize, params.border.labelFontSize)
    : 0;
  const labelHeight = labelLines * params.border.labelFontSize * 1.5;
  const canvasHeight = exportSize + labelHeight;

  // 图层产出
  const layers: string[] = [];

  // 【Layer 1】背景
  layers.push(`<!-- 背景 -->`);
  layers.push(drawSvgBackground(exportSize, canvasHeight, params.color.background));

  // 【Layer 2】码点
  layers.push(`<!-- 码点 -->`);
  const { dots, defs: dotDefs } = drawSvgDots({
    matrix,
    matrixSize: rows,
    dotSize,
    style: params.dot.style,
    cornerRadius: params.dot.cornerRadius,
    circleRatio: params.dot.circleRatio,
    sizeRatio: params.dot.sizeRatio,
    offsetX,
    offsetY,
    color: params.color,
    canvasSize: exportSize,
  });
  layers.push(dots);

  // 【Layer 3】Logo
  let logoDefs = '';
  if (params.logo.enabled && params.logo.imageDataUrl) {
    layers.push(`<!-- Logo -->`);
    const logoAreaSize = qrTotalSize * params.logo.sizeRatio;
    logoDefs = drawSvgLogo({
      imageDataUrl: params.logo.imageDataUrl,
      logoAreaSize,
      canvasSize: exportSize,
      maskShape: params.logo.maskShape,
      maskPadding: params.logo.maskPadding,
      maskColor: params.logo.maskColor,
    });
    layers.push(logoDefs);
  }

  // 【Layer 5】边框
  layers.push(`<!-- 边框 -->`);
  const borderSvg = drawSvgBorder(exportSize, qrTotalSize, params.border);
  if (borderSvg) layers.push(borderSvg);

  // 【Layer 4】文本标签
  layers.push(`<!-- 标签 -->`);
  const labelSvg = drawSvgLabel(exportSize, qrTotalSize, {
    labelText: params.border.labelText,
    labelColor: params.border.labelColor,
    labelFontSize: params.border.labelFontSize,
  });
  if (labelSvg) layers.push(labelSvg);

  // 组装 defs（渐变 + Logo clipPath）
  const defsContent = [dotDefs, extractClipPaths(logoDefs)]
    .filter(Boolean)
    .join('\n');
  const defsBlock = defsContent ? `<defs>\n${defsContent}\n</defs>` : '';

  // 提取 Logo 中非 clipPath 的部分（遮罩背景 + image 元素）
  const logoBody = extractLogoBody(logoDefs);

  // 最终 SVG 文档
  const bodyContent = [
    defsBlock,
    layers[0], // 背景注释
    layers[1], // 背景
    layers[2], // 码点注释
    layers[3], // 码点
    logoBody ? `<!-- Logo -->\n${logoBody}` : '',
    borderSvg ? `<!-- 边框 -->\n${borderSvg}` : '',
    labelSvg ? `<!-- 标签 -->\n${labelSvg}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${exportSize}" height="${canvasHeight}" viewBox="0 0 ${exportSize} ${canvasHeight}">\n${bodyContent}\n</svg>`;
}

/** 生成 SVG Blob */
export function svgToBlob(svgString: string): Blob {
  return new Blob([svgString], { type: 'image/svg+xml' });
}

/** 从 Logo 输出中提取 <clipPath> 元素 */
function extractClipPaths(svg: string): string {
  const match = svg.match(/<clipPath[^>]*>[\s\S]*?<\/clipPath>/g);
  return match ? match.join('\n') : '';
}

/** 从 Logo 输出中提取非 clipPath 元素 */
function extractLogoBody(svg: string): string {
  return svg.replace(/<clipPath[^>]*>[\s\S]*?<\/clipPath>/g, '').trim();
}
