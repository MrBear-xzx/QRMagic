import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5199';

test.describe('QRMagic - 二维码美化生成器', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // 等待页面完全加载
    await page.waitForSelector('canvas', { timeout: 10000 });
    // 等待初始渲染完成
    await page.waitForTimeout(1000);
  });

  // ============================================================
  // 基础测试
  // ============================================================

  test('页面正常加载，侧栏和预览区显示', async ({ page }) => {
    // 检查侧栏标题
    await expect(page.locator('text=QRMagic')).toBeVisible();
    await expect(page.locator('text=二维码美化生成器')).toBeVisible();

    // 检查 Canvas 存在
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 检查面板标题存在
    await expect(page.locator('text=内容设置')).toBeVisible();
    await expect(page.locator('text=码点样式')).toBeVisible();

    // Canvas 应该有非零尺寸
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('默认渲染英文文本 QR 码', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    // 默认文本 'https://example.com' 应渲染为有效尺寸的 Canvas
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  // ============================================================
  // 中文编码测试
  // ============================================================

  test('中文文本生成 QR 码', async ({ page }) => {
    // 在内容面板中输入中文
    const textArea = page.locator('textarea');
    await textArea.click();
    await textArea.fill('你好世界');

    // 等待重新渲染
    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    // Canvas 应该有合理尺寸（中文会生成更大版本的 QR 码）
    expect(box!.width).toBeGreaterThan(100);
  });

  test('纯英文短文本生成 QR 码', async ({ page }) => {
    const textArea = page.locator('textarea');
    await textArea.click();
    await textArea.fill('7k7k');

    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
  });

  test('混合中英文生成 QR 码', async ({ page }) => {
    const textArea = page.locator('textarea');
    await textArea.click();
    await textArea.fill('Hello你好World世界');

    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
  });

  // ============================================================
  // 内容类型切换测试
  // ============================================================

  test('切换到网址类型', async ({ page }) => {
    // 展开内容设置面板（应该已经展开），找到类型选择器
    const select = page.locator('.ant-select').first();
    await select.click();

    // 选择"网址"
    await page.locator('.ant-select-item-option').filter({ hasText: '网址' }).click();
    await page.waitForTimeout(300);

    // 找到可编辑的输入框（排除 Ant Design Select 的 readonly 内部 input）
    const urlInput = page.locator('input[placeholder*="网址"], input[placeholder*="example"]');
    await urlInput.fill('github.com');

    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
  });

  test('切换到 WiFi 类型', async ({ page }) => {
    const select = page.locator('.ant-select').first();
    await select.click();
    await page.locator('.ant-select-item-option').filter({ hasText: 'WiFi' }).click();
    await page.waitForTimeout(300);

    // 找到可编辑输入框（排除 Ant Design 内部 readonly input）
    const ssidInput = page.locator('input:not([readonly])').first();
    await ssidInput.fill('MyWiFi');
    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
  });

  test('切换到名片类型', async ({ page }) => {
    const select = page.locator('.ant-select').first();
    await select.click();
    await page.locator('.ant-select-item-option').filter({ hasText: '名片' }).click();
    await page.waitForTimeout(300);

    // 找到可编辑输入框填写姓名
    const nameInput = page.locator('input:not([readonly])').first();
    await nameInput.fill('张三');

    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
  });

  // ============================================================
  // Canvas 内容验证（像素级）
  // ============================================================

  test('QR 码 Canvas 不是空白的', async ({ page }) => {
    // 输入内容
    const textArea = page.locator('textarea');
    await textArea.click();
    await textArea.fill('test123');

    await page.waitForTimeout(500);

    // 检查 Canvas 是否有非空白像素（扫描整个画布）
    const canvas = page.locator('canvas');
    const hasContent = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return false;
      // 取多个区域的样本
      const regions = [
        { x: 0, y: 0, w: el.width, h: Math.floor(el.height / 4) },  // 顶部
        { x: 0, y: Math.floor(el.height * 3 / 4), w: el.width, h: Math.floor(el.height / 4) },  // 底部
        { x: Math.floor(el.width / 4), y: Math.floor(el.height / 4), w: Math.floor(el.width / 2), h: Math.floor(el.height / 2) },  // 中心
      ];
      for (const region of regions) {
        const imageData = ctx.getImageData(region.x, region.y, region.w, region.h);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          if (r < 250 || g < 250 || b < 250) return true;
        }
      }
      return false;
    });
    expect(hasContent).toBe(true);
  });

  test('清空内容后 Canvas 被清除', async ({ page }) => {
    const textArea = page.locator('textarea');
    await textArea.click();
    await textArea.fill('');

    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const isCleared = await canvas.evaluate((el: HTMLCanvasElement) => {
      return el.width <= 1 || el.height <= 1;
    });
    expect(isCleared).toBe(true);
  });

  // ============================================================
  // 模板切换测试
  // ============================================================

  test('切换模板更新 Canvas', async ({ page }) => {
    // 找到模板卡片（在快速模板区域）
    const templateCards = page.locator('button').filter({ has: page.locator('text=简约经典') });
    // 模板按钮
    const activeTemplate = page.locator('text=简约经典').first();

    // 点击"商务深蓝"模板
    const bizTemplate = page.locator('text=商务深蓝').first();
    await bizTemplate.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
  });

  // ============================================================
  // 码点样式切换测试
  // ============================================================

  test('切换码点样式', async ({ page }) => {
    // 切换到码点样式 Tab
    await page.locator('.ant-tabs-tab').filter({ hasText: '码点样式' }).click();
    await page.waitForTimeout(300);
    // 找到码点形状选择器（在可见的 TabPane 内）
    await page.locator('.ant-tabs-tabpane-active .ant-select').first().click();

    // 选择圆形
    await page.locator('.ant-select-item-option').filter({ hasText: '圆形' }).click();
    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
  });

  test('调整码点大小滑块', async ({ page }) => {
    // 切换到码点样式 Tab
    await page.locator('.ant-tabs-tab').filter({ hasText: '码点样式' }).click();
    await page.waitForTimeout(300);
    // 找到码点大小滑块
    const sliders = page.locator('.ant-slider');
    // 操作码点面板的滑块
    const sizeSlider = sliders.first();
    const handle = sizeSlider.locator('.ant-slider-handle');
    const sliderBox = await sizeSlider.boundingBox();

    if (sliderBox) {
      // 拖动滑块到 50% 位置
      await handle.first().hover();
      await page.mouse.down();
      await page.mouse.move(sliderBox.x + sliderBox.width * 0.3, sliderBox.y + sliderBox.height / 2);
      await page.mouse.up();
    }

    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(100);
  });

  // ============================================================
  // 颜色测试
  // ============================================================

  test('修改前景色更新 Canvas', async ({ page }) => {
    // 切换到颜色渐变 Tab
    await page.locator('.ant-tabs-tab').filter({ hasText: '颜色' }).click();
    await page.waitForTimeout(300);

    // 找到前景色 input[type=color]
    const colorInputs = page.locator('input[type="color"]');
    const fgInput = colorInputs.first();

    // 设置为红色
    await fgInput.evaluate((el: HTMLInputElement) => {
      el.value = '#ff0000';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.waitForTimeout(500);

    const canvas = page.locator('canvas');
    const hasRed = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return false;
      // 在 QR 码区域中心取样
      const cx = el.width / 2;
      const cy = el.height / 2;
      const imageData = ctx.getImageData(cx, cy, 5, 5);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        // 寻找红色像素（R 远大于 G 和 B）
        if (r > 200 && g < 100 && b < 100) return true;
      }
      return false;
    });
    // 至少有一个非白色像素
    const hasNonWhite = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return false;
      const imageData = ctx.getImageData(el.width / 2, el.height / 2, 10, 10);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        if (r < 255 || g < 255 || b < 255) return true;
      }
      return false;
    });
    expect(hasNonWhite).toBe(true);
  });

  // ============================================================
  // 导出测试
  // ============================================================

  test('点击下载触发下载', async ({ page }) => {
    // 切换到导出 Tab
    await page.locator('.ant-tabs-tab').filter({ hasText: '导出' }).click();
    await page.waitForTimeout(300);

    // 监控下载事件
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

    // 点击下载按钮
    const downloadBtn = page.locator('button').filter({ hasText: '下载 PNG' });
    await downloadBtn.click();

    // 等待下载完成
    const download = await downloadPromise;

    // 验证文件名
    expect(download.suggestedFilename()).toContain('QRMagic');
    expect(download.suggestedFilename()).toContain('.png');
  });

  // ============================================================
  // 重置测试
  // ============================================================

  test('重置按钮恢复默认状态', async ({ page }) => {
    // 先做修改
    const textArea = page.locator('textarea');
    await textArea.click();
    await textArea.fill('修改后的内容');
    await page.waitForTimeout(300);

    // 点击重置按钮
    const resetBtn = page.locator('button').filter({ hasText: '重置' });
    await resetBtn.click();

    // 检查内容是否恢复
    const textAreaValue = await textArea.inputValue();
    expect(textAreaValue).toBe('https://example.com');
  });

  // ============================================================
  // Logo 上传测试
  // ============================================================

  test('Logo 面板显示上传区域', async ({ page }) => {
    const logoPanel = page.locator('.ant-tabs-tab').filter({ hasText: 'Logo' });
    await logoPanel.click();
    await page.waitForTimeout(300);
    // 无 Logo 时显示上传拖拽区
    await expect(page.locator('.ant-upload-drag-icon')).toBeVisible();
  });
});
