import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    // 使用系统已安装的 Google Chrome
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 10000,
  },
  webServer: {
    command: 'npx vite --port 5199 --strictPort',
    port: 5199,
    reuseExistingServer: true,
    timeout: 30000,
  },
  // 确保 Playwright 能找到 Chrome
  projects: [
    {
      name: 'chrome',
      use: {
        channel: 'chrome',
      },
    },
  ],
});
