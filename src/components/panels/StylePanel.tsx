import { Form, Select, Slider } from 'antd';
import { useQRStore } from '@/store/useQRStore';
import type { DotStyle } from '@/types';

const DOT_STYLES: { value: DotStyle; label: string }[] = [
  { value: 'square', label: '方块' },
  { value: 'circle', label: '圆形' },
  { value: 'rounded', label: '圆角方块' },
];

export function StylePanel() {
  const dot = useQRStore((s) => s.params.dot);
  const setDotStyle = useQRStore((s) => s.setDotStyle);
  const updateDot = useQRStore((s) => s.updateDot);

  return (
    <div>
      <Form.Item label="码点形状">
        <Select
          value={dot.style}
          onChange={(v) => setDotStyle(v)}
          options={DOT_STYLES}
        />
      </Form.Item>

      {dot.style === 'rounded' && (
        <Form.Item label="圆角半径">
          <Slider
            min={0}
            max={50}
            value={dot.cornerRadius}
            onChange={(v) => updateDot({ cornerRadius: v })}
            marks={{ 0: '0', 12: '12', 25: '25', 50: '50' }}
          />
        </Form.Item>
      )}

      {dot.style === 'circle' && (
        <Form.Item label="圆形比例">
          <Slider
            min={0.3}
            max={1}
            step={0.05}
            value={dot.circleRatio}
            onChange={(v) => updateDot({ circleRatio: v })}
            marks={{ 0.3: '小', 0.65: '中', 1: '大' }}
          />
        </Form.Item>
      )}

      <Form.Item label="码点大小">
        <Slider
          min={0.5}
          max={1}
          step={0.05}
          value={dot.sizeRatio}
          onChange={(v) => updateDot({ sizeRatio: v })}
          marks={{ 0.5: '50%', 0.75: '75%', 1: '100%' }}
          tooltip={{ formatter: (v) => `${Math.round((v || 1) * 100)}%` }}
        />
      </Form.Item>
    </div>
  );
}
