# QRMagic — 二维码美化生成器

纯前端二维码美化工具，功能对标[草料二维码](https://cli.im/)。支持 6 种内容类型、5 种码点样式、颜色渐变、Logo 嵌入、边框装饰、模板一键切换、PNG 导出。

## ✨ 功能

- **多种内容** — 文本、网址、名片（vCard）、WiFi、电话、邮箱
- **码点美化** — 方块 / 圆形 / 圆角方块 / 菱形 / 五角星
- **颜色渐变** — 纯色 / 线性渐变（4 方向）/ 径向渐变
- **Logo 嵌入** — 拖拽上传，圆形/圆角遮罩，自动安全区域缩放
- **边框装饰** — 实线边框、圆角、底部文字标签
- **6 个模板** — 简约经典 / 商务深蓝 / 活力渐变 / 清新绿意 / 暗夜模式 / 极客像素
- **实时预览** — Canvas 渲染，缩放拖拽
- **PNG 导出** — 256~2048px 预设尺寸 + 自定义边距

## 🚀 快速开始

```bash
# 安装依赖（使用 pnpm）
pnpm install

# 启动开发服务器
pnpm dev
```

浏览器打开 http://localhost:5173

```bash
# 生产构建
pnpm build

# 运行测试
npx playwright test
```

## 🛠 技术栈

React 18 · TypeScript · Ant Design 5 · Tailwind CSS · Zustand · Vite 5 · qrcode · Canvas API · Playwright

## 📁 项目结构

```
QRMagic/
├── src/
│   ├── types/          # 类型定义
│   ├── store/          # Zustand 状态
│   ├── encoder/        # QR 编码（UTF-8 中文支持）
│   ├── renderer/       # Canvas 5 层渲染引擎
│   ├── components/     # React 组件
│   │   ├── layout/     # 布局
│   │   ├── preview/    # 预览区
│   │   └── panels/     # 参数面板
│   ├── templates/      # 内置模板
│   └── utils/          # 工具函数
├── tests/              # Playwright E2E 测试
└── dist/               # 构建产物
```

## 📝 License

MIT
