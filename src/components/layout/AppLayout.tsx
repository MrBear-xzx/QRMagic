import { useCallback, useState } from 'react';
import { Button, Space, Typography, Tabs } from 'antd';
import { ReloadOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useQRStore } from '@/store/useQRStore';
import { TemplateBar } from '../panels/TemplateBar';
import { ContentPanel } from '../panels/ContentPanel';
import { StylePanel } from '../panels/StylePanel';
import { ColorPanel } from '../panels/ColorPanel';
import { LogoPanel } from '../panels/LogoPanel';
import { BorderPanel } from '../panels/BorderPanel';
import { ExportPanel } from '../panels/ExportPanel';
import { BatchPanel } from '../panels/BatchPanel';
import { HistoryPanel } from '../panels/HistoryPanel';
import { QRPreview } from '../preview/QRPreview';

const { Text } = Typography;

const tabItems = [
  { key: 'export', label: '导出', icon: '⬇️', children: <ExportPanel /> },
  { key: 'style', label: '码点样式', icon: '⬛', children: <StylePanel /> },
  { key: 'color', label: '颜色渐变', icon: '🎨', children: <ColorPanel /> },
  { key: 'logo', label: 'Logo', icon: '🖼️', children: <LogoPanel /> },
  { key: 'border', label: '边框', icon: '🔲', children: <BorderPanel /> },
  { key: 'batch', label: '批量', icon: '📦', children: <BatchPanel /> },
  { key: 'history', label: '历史', icon: '🕐', children: <HistoryPanel /> },
];

export function AppLayout() {
  const resetParams = useQRStore((s) => s.resetParams);
  const [activeTab, setActiveTab] = useState('export');

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ background: '#1C1C1E' }}>
      {/* ========== 顶栏 ========== */}
      <header
        className="flex items-center shrink-0 px-5 py-3 mobile-header"
        style={{
          background: '#1C1C1E',
          borderBottom: '1px solid #48484A',
          gap: 16,
        }}
      >
        {/* Logo */}
        <Space align="center" size={8} style={{ flexShrink: 0 }}>
          <QrcodeOutlined style={{ fontSize: 20, color: '#7B7CFF' }} />
          <div>
            <Text strong style={{ fontSize: 16, color: '#E5E5EA', display: 'block', lineHeight: 1.2 }}>
              QRMagic
            </Text>
            <Text className="mobile-hide" style={{ fontSize: 10, color: '#8E8E93', display: 'block' }}>
              二维码美化生成器
            </Text>
          </div>
        </Space>

        {/* 模板栏 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <TemplateBar />
        </div>
      </header>

      {/* ========== 内容区：左侧页签 + 右侧预览 ========== */}
      <div className="flex flex-1 overflow-hidden mobile-stack">
        {/* 左侧配置区 */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ flex: '1 1 55%', minWidth: 380 }}
        >
          {/* 内容设置（始终可见） */}
          <div
            className="shrink-0 px-4 py-3"
            style={{ background: '#2C2C2E', borderBottom: '1px solid #48484A' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#E5E5EA', fontWeight: 500 }}>📝 内容设置</span>
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={resetParams}
                style={{ color: '#8E8E93', fontSize: 12 }}
              >
                重置
              </Button>
            </div>
            <ContentPanel />
          </div>

          {/* 页签配置区 */}
          <div className="flex-1 overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
            <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            tabBarStyle={{
              margin: 0,
              padding: '4px 16px',
              background: '#1C1C1E',
              borderBottom: '1px solid #48484A',
            }}
            tabBarGutter={8}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            items={tabItems.map((item) => ({
              key: item.key,
              label: (
                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </span>
              ),
              children: (
                <div
                  className="flex-1 overflow-y-auto px-4 py-3"
                  style={{ height: '100%', background: '#2C2C2E' }}
                >
                  {item.children}
                </div>
              ),
            }))}
          />
        </div>
        </div>

        {/* 右侧预览区 */}
        <div
          className="shrink-0 flex items-center justify-center overflow-hidden dot-canvas-bg"
          style={{ flex: '0 0 45%', minWidth: 320 }}
        >
          <QRPreview />
        </div>
      </div>
    </div>
  );
}
