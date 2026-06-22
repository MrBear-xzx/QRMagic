import { useState } from 'react';
import { Form, Select, Slider, Input, Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useQRStore } from '@/store/useQRStore';
import { downloadQRCode } from '@/utils/download';

const SIZE_PRESETS = [
  { value: 256, label: '256px' },
  { value: 512, label: '512px' },
  { value: 1024, label: '1024px' },
  { value: 2048, label: '2048px' },
];

export function ExportPanel() {
  const params = useQRStore((s) => s.params);
  const updateExport = useQRStore((s) => s.updateExport);
  const exportParams = params.export;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadQRCode(params);
      message.success('二维码下载成功！');
    } catch (e) {
      message.error(e instanceof Error ? e.message : '下载失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <Form.Item label="导出格式">
        <Select
          value={exportParams.format}
          onChange={(v) => updateExport({ format: v })}
          options={[
            { value: 'png', label: 'PNG 位图' },
            { value: 'svg', label: 'SVG 矢量' },
          ]}
        />
      </Form.Item>

      <Form.Item label="导出尺寸">
        <Select
          value={exportParams.size}
          onChange={(v) => updateExport({ size: v })}
          options={SIZE_PRESETS}
        />
      </Form.Item>

      <Form.Item label="边距">
        <Slider
          min={0}
          max={100}
          value={exportParams.margin}
          onChange={(v) => updateExport({ margin: v })}
          marks={{ 0: '0', 16: '16', 50: '50', 100: '100' }}
        />
      </Form.Item>

      <Form.Item label="文件名">
        <Input
          value={exportParams.fileName}
          onChange={(e) => updateExport({ fileName: e.target.value })}
          placeholder="留空自动生成文件名"
          allowClear
        />
      </Form.Item>

      <Button
        type="primary"
        icon={<DownloadOutlined />}
        block
        size="large"
        loading={downloading}
        disabled={downloading}
        onClick={handleDownload}
        style={{
          background: '#5E5CE6',
          borderColor: '#5E5CE6',
          height: 44,
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {exportParams.format === 'svg' ? '下载 SVG' : '下载 PNG'}
      </Button>
    </div>
  );
}
