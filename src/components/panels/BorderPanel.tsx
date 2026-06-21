import { Form, Select, Slider, Input } from 'antd';
import { useQRStore } from '@/store/useQRStore';
import type { BorderStyle } from '@/types';

const BORDER_STYLES: { value: BorderStyle; label: string }[] = [
  { value: 'none', label: '无边框' },
  { value: 'solid', label: '实线边框' },
];

export function BorderPanel() {
  const border = useQRStore((s) => s.params.border);
  const updateBorder = useQRStore((s) => s.updateBorder);

  return (
    <div>
      <Form.Item label="边框样式">
        <Select
          value={border.style}
          onChange={(v) => updateBorder({ style: v })}
          options={BORDER_STYLES}
        />
      </Form.Item>

      {border.style !== 'none' && (
        <>
          <Form.Item label="边框宽度">
            <Slider
              min={2}
              max={40}
              value={border.width}
              onChange={(v) => updateBorder({ width: v })}
              marks={{ 2: '2', 8: '8', 20: '20', 40: '40' }}
            />
          </Form.Item>

          <Form.Item label="边框颜色">
            <input
              type="color"
              value={border.color}
              onChange={(e) => updateBorder({ color: e.target.value })}
              style={{ width: '100%', height: 36, cursor: 'pointer' }}
            />
          </Form.Item>

          <Form.Item label="边框圆角">
            <Slider
              min={0}
              max={40}
              value={border.borderRadius}
              onChange={(v) => updateBorder({ borderRadius: v })}
              marks={{ 0: '0', 16: '16', 40: '40' }}
            />
          </Form.Item>
        </>
      )}

      <Form.Item label="底部文字">
        <Input
          value={border.labelText}
          onChange={(e) => updateBorder({ labelText: e.target.value })}
          placeholder="二维码下方的标签文字"
          allowClear
        />
      </Form.Item>

      {border.labelText && (
        <>
          <Form.Item label="文字颜色">
            <input
              type="color"
              value={border.labelColor}
              onChange={(e) => updateBorder({ labelColor: e.target.value })}
              style={{ width: '100%', height: 36, cursor: 'pointer' }}
            />
          </Form.Item>

          <Form.Item label="文字大小">
            <Slider
              min={10}
              max={32}
              value={border.labelFontSize}
              onChange={(v) => updateBorder({ labelFontSize: v })}
              marks={{ 10: '10', 14: '14', 20: '20', 32: '32' }}
            />
          </Form.Item>
        </>
      )}
    </div>
  );
}
