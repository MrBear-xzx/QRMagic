/** 内容类型枚举 */
export type ContentType = 'text' | 'url' | 'vcard' | 'wifi' | 'phone' | 'email';

/** 码点样式枚举 */
export type DotStyle = 'square' | 'circle' | 'rounded' | 'diamond' | 'star';

/** 渐变类型 */
export type GradientType = 'none' | 'linear' | 'radial';

/** 线性渐变方向 */
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'anti-diagonal';

/** QR 容错等级 */
export type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

/** Logo 遮罩形状 */
export type LogoMaskShape = 'circle' | 'rounded';

/** 边框样式 */
export type BorderStyle = 'none' | 'solid';

/** 加密类型（WiFi） */
export type WiFiEncryption = 'WPA' | 'WEP' | 'nopass';

/** 内容参数 */
export interface ContentParams {
  type: ContentType;
  // 文本
  text?: string;
  // 网址
  url?: string;
  // 名片
  vcardName?: string;
  vcardPhone?: string;
  vcardEmail?: string;
  vcardCompany?: string;
  vcardTitle?: string;
  // WiFi
  wifiSsid?: string;
  wifiPassword?: string;
  wifiEncryption?: WiFiEncryption;
  // 电话
  phone?: string;
  // 邮箱
  email?: string;
  emailSubject?: string;
  emailBody?: string;
}

/** 码点样式参数 */
export interface DotParams {
  style: DotStyle;
  /** 圆角半径（rounded 样式使用）0~50 */
  cornerRadius: number;
  /** 圆形半径比例 0~1 */
  circleRatio: number;
  /** 码点大小比例 0.5~1 */
  sizeRatio: number;
}

/** 颜色参数 */
export interface ColorParams {
  foreground: string;
  background: string;
  gradientType: GradientType;
  gradientDirection: GradientDirection;
  gradientColor1: string;
  gradientColor2: string;
}

/** Logo 参数 */
export interface LogoParams {
  enabled: boolean;
  imageDataUrl: string | null;
  /** Logo 占二维码比例 0~0.3 */
  sizeRatio: number;
  maskShape: LogoMaskShape;
  /** 遮罩边距 px */
  maskPadding: number;
  /** 遮罩背景色 */
  maskColor: string;
}

/** 边框参数 */
export interface BorderParams {
  style: BorderStyle;
  width: number;
  color: string;
  borderRadius: number;
  /** 底部文本标签 */
  labelText: string;
  labelColor: string;
  labelFontSize: number;
}

/** 导出参数 */
export interface ExportParams {
  format: 'png' | 'svg';
  size: number;
  margin: number;
  fileName: string;
}

/** 容错等级 */
export interface ErrorCorrectionParams {
  level: ErrorLevel;
}

/** 完整的 QR 参数 */
export interface QRParams {
  content: ContentParams;
  dot: DotParams;
  color: ColorParams;
  logo: LogoParams;
  border: BorderParams;
  export: ExportParams;
  errorCorrection: ErrorCorrectionParams;
}

/** 模板定义 */
export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  params: Partial<QRParams>;
}

/** QR 矩阵：二维布尔数组，true = 黑色码点 */
export type QRMatrix = boolean[][];

/** QR 编码结果 */
export interface QREncodeResult {
  matrix: QRMatrix;
  size: number; // 矩阵大小（如 29×29）
  modules: number;
}
