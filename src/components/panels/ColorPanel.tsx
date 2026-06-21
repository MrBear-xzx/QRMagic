import { Form, Select, Input } from 'antd';
import { useQRStore } from '@/store/useQRStore';
import type { GradientType, GradientDirection } from '@/types';

const GRADIENT_TYPES: { value: GradientType; label: string }[] = [
  { value: 'none', label: '无渐变' },
  { value: 'linear', label: '线性渐变' },
  { value: 'radial', label: '径向渐变' },
];

const GRADIENT_DIRECTIONS: { value: GradientDirection; label: string }[] = [
  { value: 'horizontal', label: '水平 →' },
  { value: 'vertical', label: '垂直 ↓' },
  { value: 'diagonal', label: '对角线 ↘' },
  { value: 'anti-diagonal', label: '反对角线 ↗' },
];

export function ColorPanel() {
  const color = useQRStore((s) => s.params.color);
  const updateColor = useQRStore((s) => s.updateColor);

  return (
    <div>
      <Form.Item label="前景色">
        <Input
          type="color"
          value={color.foreground}
          onChange={(e) => updateColor({ foreground: e.target.value })}
          style={{ width: '100%', height: 36, cursor: 'pointer' }}
        />
      </Form.Item>

      <Form.Item label="背景色">
        <Input
          type="color"
          value={color.background}
          onChange={(e) => updateColor({ background: e.target.value })}
          style={{ width: '100%', height: 36, cursor: 'pointer' }}
        />
      </Form.Item>

      <Form.Item label="渐变类型">
        <Select
          value={color.gradientType}
          onChange={(v) => updateColor({ gradientType: v })}
          options={GRADIENT_TYPES}
        />
      </Form.Item>

      {color.gradientType !== 'none' && (
        <>
          {color.gradientType === 'linear' && (
            <Form.Item label="渐变方向">
              <Select
                value={color.gradientDirection}
                onChange={(v) => updateColor({ gradientDirection: v })}
                options={GRADIENT_DIRECTIONS}
              />
            </Form.Item>
          )}

          <Form.Item label="渐变起始色">
            <Input
              type="color"
              value={color.gradientColor1}
              onChange={(e) => updateColor({ gradientColor1: e.target.value })}
              style={{ width: '100%', height: 36, cursor: 'pointer' }}
            />
          </Form.Item>

          <Form.Item label="渐变结束色">
            <Input
              type="color"
              value={color.gradientColor2}
              onChange={(e) => updateColor({ gradientColor2: e.target.value })}
              style={{ width: '100%', height: 36, cursor: 'pointer' }}
            />
          </Form.Item>
        </>
      )}
    </div>
  );
}
