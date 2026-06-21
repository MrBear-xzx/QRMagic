import { useCallback, useState, type ReactNode } from 'react';
import { Button, Space, Typography, Collapse } from 'antd';
import {
  ReloadOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { useQRStore, getDefaultParams } from '@/store/useQRStore';
import { TemplateBar } from '../panels/TemplateBar';
import { ContentPanel } from '../panels/ContentPanel';
import { StylePanel } from '../panels/StylePanel';
import { ColorPanel } from '../panels/ColorPanel';
import { LogoPanel } from '../panels/LogoPanel';
import { BorderPanel } from '../panels/BorderPanel';
import { ExportPanel } from '../panels/ExportPanel';
import { QRPreview } from '../preview/QRPreview';

const { Text } = Typography;

const panelItems = [
  {
    key: 'content',
    label: '内容设置',
    icon: <QrcodeOutlined />,
    children: <ContentPanel />,
  },
  {
    key: 'style',
    label: '码点样式',
    icon: <span style={{ fontSize: 16 }}>◆</span>,
    children: <StylePanel />,
  },
  {
    key: 'color',
    label: '颜色渐变',
    icon: <span style={{ fontSize: 16 }}>🎨</span>,
    children: <ColorPanel />,
  },
  {
    key: 'logo',
    label: 'Logo 设置',
    icon: <span style={{ fontSize: 16 }}>🖼️</span>,
    children: <LogoPanel />,
  },
  {
    key: 'border',
    label: '边框装饰',
    icon: <span style={{ fontSize: 16 }}>🔲</span>,
    children: <BorderPanel />,
  },
  {
    key: 'export',
    label: '导出',
    icon: <span style={{ fontSize: 16 }}>⬇️</span>,
    children: <ExportPanel />,
  },
];

export function AppLayout() {
  const resetParams = useQRStore((s) => s.resetParams);
  const [activeKeys, setActiveKeys] = useState<string[]>(['content', 'style']);

  const handleCollapseChange = useCallback((keys: string | string[]) => {
    setActiveKeys(Array.isArray(keys) ? keys : [keys]);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ========== 深色侧栏 ========== */}
      <aside
        className="flex flex-col h-full overflow-hidden shrink-0"
        style={{ width: 380, backgroundColor: '#1C1C1E' }}
      >
        {/* 侧栏头部 */}
        <header
          className="flex items-center justify-between shrink-0 px-5 py-4"
          style={{ borderBottom: '1px solid #48484A' }}
        >
          <Space align="center" size={10}>
            <QrcodeOutlined style={{ fontSize: 22, color: '#7B7CFF' }} />
            <div>
              <Text
                strong
                style={{
                  fontSize: 18,
                  color: '#E5E5EA',
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1.3,
                }}
              >
                QRMagic
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: '#8E8E93',
                  display: 'block',
                }}
              >
                二维码美化生成器
              </Text>
            </div>
          </Space>

          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={resetParams}
            style={{ color: '#8E8E93' }}
            title="重置所有参数"
          >
            重置
          </Button>
        </header>

        {/* 模板快速选择 */}
        <div className="shrink-0 px-5 pt-4 pb-2">
          <TemplateBar />
        </div>

        {/* 手风琴式参数面板 */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <CollapseSection
            items={panelItems}
            activeKeys={activeKeys}
            onChange={handleCollapseChange}
          />
        </div>
      </aside>

      {/* ========== 明亮预览区 ========== */}
      <main className="flex-1 h-full dot-canvas-bg flex items-center justify-center overflow-hidden">
        <QRPreview />
      </main>
    </div>
  );
}

/** 自定义手风琴面板 */
function CollapseSection({
  items,
  activeKeys,
  onChange,
}: {
  items: Array<{ key: string; label: string; icon: ReactNode; children: ReactNode }>;
  activeKeys: string[];
  onChange: (keys: string | string[]) => void;
}) {
  const collapseItems = items.map((item) => ({
    key: item.key,
    label: (
      <Space size={8}>
        {item.icon}
        <Text style={{ color: '#E5E5EA', fontSize: 14, fontWeight: 500 }}>
          {item.label}
        </Text>
      </Space>
    ),
    children: (
      <div
        style={{
          background: '#2C2C2E',
          borderRadius: 8,
          padding: '12px 16px',
        }}
      >
        {item.children}
      </div>
    ),
    style: {
      border: 'none',
      borderBottom: '1px solid #48484A',
      borderRadius: 0,
      background: 'transparent',
    },
  }));

  return (
    <Collapse
      activeKey={activeKeys}
      onChange={onChange}
      bordered={false}
      expandIconPosition="end"
      items={collapseItems}
      style={{ background: 'transparent' }}
    />
  );
}
