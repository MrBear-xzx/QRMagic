# QRMagic — 二维码美化生成器

## 项目概述

纯前端 Web SPA 二维码美化工具，功能对标草料二维码（CLI.im）。支持内容编码、码点样式、颜色渐变、Logo 嵌入、边框装饰、模板系统和 PNG 导出。仅简体中文。

## 技术栈

- **框架**：React 18 + TypeScript（strict）
- **构建**：Vite 5
- **UI**：Ant Design 5（深色主题 ConfigProvider）+ Tailwind CSS 3
- **状态**：Zustand 4
- **编码**：qrcode 1.5（Byte 模式 UTF-8 中文支持）
- **渲染**：自研 Canvas 5 层渲染引擎
- **测试**：Playwright 1.61 + Chrome

## 目录结构

```
src/
├── types/index.ts              # 全局类型（QRParams, Template 等）
├── store/useQRStore.ts         # Zustand 状态管理
├── encoder/qrEncoder.ts        # 6 种内容类型 → QR 矩阵编码
├── renderer/
│   ├── index.ts                # 渲染调度（Layer 1→5）
│   ├── drawBackground.ts       # 背景（纯色）
│   ├── drawDots.ts             # 码点（3 种形状 + 结构图案保护）
│   ├── drawLogo.ts             # Logo 合成
│   ├── drawBorder.ts           # 边框装饰
│   └── drawLabel.ts            # 文本标签
├── components/
│   ├── layout/AppLayout.tsx    # 深色侧栏 + 明亮预览区
│   ├── preview/QRPreview.tsx   # Canvas 预览 + 缩放拖拽
│   ├── preview/useCanvasRenderer.ts
│   └── panels/
│       ├── ContentPanel.tsx    # 内容类型（文本/网址/名片/WiFi/电话/邮箱）
│       ├── StylePanel.tsx      # 码点样式（方块/圆形/圆角方块）
│       ├── ColorPanel.tsx      # 颜色渐变
│       ├── LogoPanel.tsx       # Logo 上传（customRequest 本地读取）
│       ├── BorderPanel.tsx     # 边框 + 底部文字
│       ├── ExportPanel.tsx     # PNG 下载（尺寸/边距/文件名）
│       └── TemplateBar.tsx     # 模板快速选择
├── templates/
│   ├── index.ts                # 模板注册表
│   └── builtin.ts              # 6 个内置模板
└── utils/download.ts           # 导出下载工具
```

## 渲染架构

Canvas 5 层绘制顺序：
1. 背景（纯色，渐变仅用于码点）
2. 码点（数据模块用样式，结构模块强制方块）
3. Logo（圆角/圆形遮罩，自动安全区域缩放）
4. 文本标签（自适应画布高度）
5. 边框装饰

关键规则：
- **结构图案（Finder/Timing/Alignment）必须画方块**，确保微信 ZXing 扫描兼容
- 静区 4 模块宽度，背景始终纯色
- 中文用 `TextEncoder` + Byte 模式显式 UTF-8 编码

## 内容编码

| 类型 | 编码格式 | 特殊处理 |
|------|---------|---------|
| 文本 | 纯文本 | TextEncoder UTF-8 |
| 网址 | URL | 自动补全 `https://` |
| 名片 | vCard 3.0 | RFC 6350 特殊字符转义 |
| WiFi | `WIFI:T:...;S:...;P:...;;` | `;,:` 转义 |
| 电话 | `TEL:...` | — |
| 邮箱 | `MAILTO:...` | 可选主题/正文 |

## 默认参数

| 参数 | 默认值 |
|------|--------|
| 码点样式 | rounded（圆角方块） |
| 前景色 | `#000000` |
| 背景色 | `#FFFFFF` |
| 渐变 | 关闭 |
| 容错等级 | M（15%） |
| 导出尺寸 | 1024 px |

## 运行

```bash
pnpm dev        # 开发服务器 → http://localhost:5173
pnpm build      # 生产构建 → dist/
npx playwright test  # E2E 测试（需先 pnpm dev）
```

## 注意事项

- 包管理器用 FlyEnv 管理的 pnpm
- npm 镜像 `.npmrc` 配置为 `https://registry.npmmirror.com/`
- Playwright 使用系统 Chrome（channel: 'chrome'），不额外下载浏览器
- Tailwind `preflight: false` 避免与 Ant Design 样式冲突
- 遵循 `prefers-reduced-motion: reduce` 禁用动效

---

## 开发进度

### ✅ 已完成（MVP 核心）

| 模块 | 功能 | 状态 |
|------|------|------|
| 项目脚手架 | Vite + React 18 + TS + AntD 5 + Tailwind + Zustand | ✅ |
| 类型系统 | QRParams / Template / ContentType / DotStyle 等 | ✅ |
| QR 编码 | 6 种内容类型 + UTF-8 中文 + vCard 转义 | ✅ |
| 渲染引擎 | Canvas 5 层绘制 + 3 种码点 + 渐变 + Logo + 静区 | ✅ |
| UI 面板 | 深色侧栏 + 手风琴面板 + 预览缩放拖拽 + 模板选择 | ✅ |
| 导出 | PNG/SVG 下载 + 4 档尺寸 + 边距 + 文件名 | ✅ |
| 模板 | 6 个内置模板（经典/商务/活力/清新/暗夜/极客） | ✅ |
| Bug 修复 | 14 个 High/Medium 问题（渐变背景、vCard 转义等） | ✅ |
| 编译 | TypeScript strict 模式 + Vite build 通过 | ✅ |
| 测试 | Playwright 17 项 E2E 通过（Chrome） | ✅ |

### 🔴 待测试（需真机验证）

| 项目 | 说明 | 优先级 |
|------|------|--------|
| 微信扫码 | 时序/对准则强制方块，需真机微信扫一扫验证 | 🔴 高 |
| 小米 AI 扫码 | 用户反馈可用，需确认最新修复后仍可用 | 🟡 中 |
| Logo 上传 | 改为 customRequest 后需手动测试上传流程 | 🟡 中 |
| 底部标签文字 | Canvas 高度自适应后需验证视觉效果 | 🟡 中 |
| 渐变模板 | 商务深蓝/活力渐变背景纯色化后需视觉确认 | 🟡 中 |
| 移动端响应式 | 768px 以下视口布局 | 🟢 低 |

### ⬜ 待实现（后续迭代）

| 功能 | 说明 |
|------|------|
| 批量生成 | CSV 导入 + ZIP 导出 |
| 历史记录 | localStorage 最近 20 条 |
| 自定义模板 | 用户保存/管理模板 |
| PWA | Service Worker 离线缓存 |
| Logo 拖拽上传 | 预览区直接拖拽 |
| 容错等级选择器 | UI 暴露 L/M/Q/H 选择 |
| 模板缩略图 | 为内置模板生成预览图 |
| Logo 上传 E2E 测试 | Playwright 模拟文件上传全流程 |
| 移动端视口测试 | iPhone/Android 视口基础测试 |
| 扫码验证辅助脚本 | 生成固定内容 PNG 用于真机扫码验证 |
| 二维码解码验证 | 下载的 PNG 反向解码验证内容正确性 |

### 🐛 已知问题

1. **微信扫码兼容性**：已加入时序/对准图案方块绘制，但未用真机验证。需要分别在 iOS 微信、Android 微信上测试。
2. **边框标签与 Canvas 边界**：标签文字过长时会超出画布右侧，没有自动换行。
3. **Logo 上传后不生效**：`customRequest` 修复后未经手动端到端测试。
4. **大内容编码**：超长文本可能超出 QR 版本 40 限制，暂无错误提示。

### 下次新开会话快速启动

```bash
cd d:/workspace/AiCodingProject/QRMagic
pnpm dev                           # 启动开发服务器 → http://localhost:5173
npx playwright test --reporter=list  # E2E 测试
pnpm build                          # 生产构建
```
