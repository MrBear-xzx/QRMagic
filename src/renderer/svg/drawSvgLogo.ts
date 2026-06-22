import type { LogoParams } from '@/types';

interface DrawSvgLogoOptions {
  imageDataUrl: string;
  logoAreaSize: number;
  canvasSize: number;
  maskShape: 'circle' | 'rounded';
  maskPadding: number;
  maskColor: string;
}

/** 绘制 SVG Logo 层 */
export function drawSvgLogo(options: DrawSvgLogoOptions): string {
  const { imageDataUrl, logoAreaSize, canvasSize, maskShape, maskPadding, maskColor } = options;

  if (logoAreaSize <= 0 || !imageDataUrl) return '';

  const logoX = (canvasSize - logoAreaSize) / 2;
  const logoY = (canvasSize - logoAreaSize) / 2;
  const maskSize = logoAreaSize + maskPadding * 2;
  const maskX = logoX - maskPadding;
  const maskY = logoY - maskPadding;

  const parts: string[] = [];

  // 遮罩背景
  if (maskPadding > 0) {
    if (maskShape === 'circle') {
      const maskCenter = maskX + maskSize / 2;
      parts.push(`<circle cx="${maskCenter}" cy="${maskCenter}" r="${maskSize / 2}" fill="${maskColor}"/>`);
    } else {
      parts.push(`<rect x="${maskX}" y="${maskY}" width="${maskSize}" height="${maskSize}" rx="8" fill="${maskColor}"/>`);
    }
  }

  // Logo clipPath
  const clipId = 'logo-clip';
  const clipPath =
    maskShape === 'circle'
      ? `<clipPath id="${clipId}"><circle cx="${logoX + logoAreaSize / 2}" cy="${logoY + logoAreaSize / 2}" r="${logoAreaSize / 2}"/></clipPath>`
      : `<clipPath id="${clipId}"><rect x="${logoX}" y="${logoY}" width="${logoAreaSize}" height="${logoAreaSize}" rx="8"/></clipPath>`;

  // Logo 图片（contain 居中）
  parts.push(clipPath);
  parts.push(
    `<image href="${escapeXmlAttr(imageDataUrl)}" x="${logoX}" y="${logoY}" width="${logoAreaSize}" height="${logoAreaSize}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid meet"/>`,
  );

  return parts.join('\n');
}

function escapeXmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
