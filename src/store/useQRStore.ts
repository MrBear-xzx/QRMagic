import { create } from 'zustand';
import type {
  ContentType,
  DotStyle,
  GradientType,
  GradientDirection,
  ErrorLevel,
  LogoMaskShape,
  BorderStyle,
  QRParams,
  Template,
} from '@/types';

/** 默认内容参数 */
const defaultContent = () => ({
  type: 'text' as ContentType,
  text: 'https://example.com',
});

/** 默认码点参数 */
const defaultDot = () => ({
  style: 'rounded' as DotStyle,
  cornerRadius: 12,
  circleRatio: 0.85,
  sizeRatio: 0.9,
});

/** 默认颜色参数 */
const defaultColor = () => ({
  foreground: '#000000',
  background: '#FFFFFF',
  gradientType: 'none' as GradientType,
  gradientDirection: 'diagonal' as GradientDirection,
  gradientColor1: '#000000',
  gradientColor2: '#333333',
});

/** 默认 Logo 参数 */
const defaultLogo = () => ({
  enabled: false,
  imageDataUrl: null as string | null,
  sizeRatio: 0.2,
  maskShape: 'rounded' as LogoMaskShape,
  maskPadding: 4,
  maskColor: '#FFFFFF',
});

/** 默认边框参数 */
const defaultBorder = () => ({
  style: 'none' as BorderStyle,
  width: 8,
  color: '#000000',
  borderRadius: 16,
  labelText: '',
  labelColor: '#000000',
  labelFontSize: 14,
});

/** 默认导出参数 */
const defaultExport = () => ({
  format: 'png' as 'png' | 'svg',
  size: 1024,
  margin: 16,
  fileName: '',
});

/** 默认容错参数 */
const defaultErrorCorrection = () => ({
  level: 'M' as ErrorLevel,
});

/** 获取默认 QR 参数 */
export function getDefaultParams(): QRParams {
  return {
    content: defaultContent(),
    dot: defaultDot(),
    color: defaultColor(),
    logo: defaultLogo(),
    border: defaultBorder(),
    export: defaultExport(),
    errorCorrection: defaultErrorCorrection(),
  };
}

interface QRStore {
  // ========== 参数状态 ==========
  params: QRParams;

  // ========== 内容类型 ==========
  setContentType: (type: ContentType) => void;
  updateContent: (patch: Partial<QRParams['content']>) => void;

  // ========== 码点样式 ==========
  setDotStyle: (style: DotStyle) => void;
  updateDot: (patch: Partial<QRParams['dot']>) => void;

  // ========== 颜色 ==========
  updateColor: (patch: Partial<QRParams['color']>) => void;

  // ========== Logo ==========
  updateLogo: (patch: Partial<QRParams['logo']>) => void;

  // ========== 边框 ==========
  updateBorder: (patch: Partial<QRParams['border']>) => void;

  // ========== 导出 ==========
  updateExport: (patch: Partial<QRParams['export']>) => void;

  // ========== 容错 ==========
  setErrorLevel: (level: ErrorLevel) => void;

  // ========== 模板 ==========
  currentTemplateId: string | null;
  applyTemplate: (template: Template) => void;
  setTemplateId: (id: string | null) => void;

  // ========== 重置 ==========
  resetParams: () => void;

  // ========== 预览缩放 ==========
  previewScale: number;
  setPreviewScale: (scale: number) => void;

  // ========== 历史记录刷新 ==========
  historyVersion: number;
  bumpHistoryVersion: () => void;
}

export const useQRStore = create<QRStore>((set) => ({
  params: getDefaultParams(),
  currentTemplateId: null,
  previewScale: 1,
  historyVersion: 0,

  setContentType: (type) =>
    set((state) => ({
      params: {
        ...state.params,
        content: {
          ...state.params.content,
          type,
        },
      },
    })),

  updateContent: (patch) =>
    set((state) => ({
      params: {
        ...state.params,
        content: { ...state.params.content, ...patch },
      },
    })),

  setDotStyle: (style) =>
    set((state) => ({
      params: {
        ...state.params,
        dot: { ...state.params.dot, style },
      },
    })),

  updateDot: (patch) =>
    set((state) => ({
      params: {
        ...state.params,
        dot: { ...state.params.dot, ...patch },
      },
    })),

  updateColor: (patch) =>
    set((state) => ({
      params: {
        ...state.params,
        color: { ...state.params.color, ...patch },
      },
    })),

  updateLogo: (patch) =>
    set((state) => ({
      params: {
        ...state.params,
        logo: { ...state.params.logo, ...patch },
      },
    })),

  updateBorder: (patch) =>
    set((state) => ({
      params: {
        ...state.params,
        border: { ...state.params.border, ...patch },
      },
    })),

  updateExport: (patch) =>
    set((state) => ({
      params: {
        ...state.params,
        export: { ...state.params.export, ...patch },
      },
    })),

  setErrorLevel: (level) =>
    set((state) => ({
      params: {
        ...state.params,
        errorCorrection: { ...state.params.errorCorrection, level },
      },
    })),

  applyTemplate: (template) =>
    set((state) => ({
      currentTemplateId: template.id,
      params: {
        ...state.params,
        ...deepMerge(state.params, template.params),
      },
    })),

  setTemplateId: (id) => set({ currentTemplateId: id }),

  resetParams: () =>
    set({
      params: getDefaultParams(),
      currentTemplateId: null,
    }),

  setPreviewScale: (scale) => set({ previewScale: scale }),

  bumpHistoryVersion: () => set((s) => ({ historyVersion: s.historyVersion + 1 })),
}));

/** 简易深度合并（专用于 QRParams） */
function deepMerge(target: QRParams, source: Partial<QRParams>): QRParams {
  return {
    content: { ...target.content, ...source.content },
    dot: { ...target.dot, ...source.dot },
    color: { ...target.color, ...source.color },
    logo: { ...target.logo, ...source.logo },
    border: { ...target.border, ...source.border },
    export: { ...target.export, ...source.export },
    errorCorrection: { ...target.errorCorrection, ...source.errorCorrection },
  };
}
