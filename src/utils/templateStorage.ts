import type { Template, QRParams } from '@/types';

const STORAGE_KEY = 'qrmagic_custom_templates';
const MAX_TEMPLATES = 10;

/** 保存当前参数为自定义模板 */
export function saveCustomTemplate(name: string, params: QRParams): Template {
  const templates = loadCustomTemplates();

  if (templates.length >= MAX_TEMPLATES) {
    throw new Error(`最多保存 ${MAX_TEMPLATES} 个模板，请先删除旧的`);
  }

  const id = `custom_${Date.now()}`;
  const template: Template = {
    id,
    name,
    description: buildDescription(params),
    preview: '',
    params: sanitizeParams(params),
  };

  templates.push(template);
  persistTemplates(templates);
  return template;
}

/** 重命名自定义模板 */
export function renameCustomTemplate(id: string, newName: string): void {
  const templates = loadCustomTemplates();
  const tpl = templates.find((t) => t.id === id);
  if (tpl) {
    tpl.name = newName;
    persistTemplates(templates);
  }
}

/** 删除自定义模板 */
export function deleteCustomTemplate(id: string): void {
  const templates = loadCustomTemplates().filter((t) => t.id !== id);
  persistTemplates(templates);
}

/** 加载全部自定义模板 */
export function loadCustomTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/** 生成描述文本 */
function buildDescription(params: QRParams): string {
  const parts: string[] = [];
  const dotLabels: Record<string, string> = { square: '方块', circle: '圆点', rounded: '圆角方块' };
  parts.push(dotLabels[params.dot.style] || params.dot.style);
  parts.push(params.color.foreground);
  if (params.color.gradientType !== 'none') {
    parts.push('渐变');
  }
  if (params.border.style !== 'none') {
    parts.push('有边框');
  }
  return parts.join(' · ');
}

/** 清理参数（Logo base64 不存，避免超限） */
function sanitizeParams(params: QRParams): Partial<QRParams> {
  return {
    ...params,
    logo: {
      ...params.logo,
      imageDataUrl: null,
    },
  };
}

function persistTemplates(templates: Template[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    console.warn('自定义模板保存失败，存储可能已满');
  }
}
