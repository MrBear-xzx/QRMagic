import { ConfigProvider, theme, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppLayout } from './components/layout/AppLayout';

/** 暗色侧栏主题配置 */
const darkSidebarTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgContainer: '#2C2C2E',
    colorBgElevated: '#3A3A3C',
    colorBorder: '#48484A',
    colorText: '#E5E5EA',
    colorTextSecondary: '#8E8E93',
    colorPrimary: '#7B7CFF',
    borderRadius: 8,
    controlHeight: 36,
    fontFamily:
      '"PingFang SC", "Microsoft YaHei", "Inter", system-ui, -apple-system, sans-serif',
  },
};

export function App() {
  return (
    <ConfigProvider locale={zhCN} theme={darkSidebarTheme}>
      <AntdApp>
        <AppLayout />
      </AntdApp>
    </ConfigProvider>
  );
}
