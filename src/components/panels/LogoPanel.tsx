import { useCallback, useState } from 'react';
import { Form, Slider, Select, Upload, Button, message } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import { useQRStore } from '@/store/useQRStore';
import type { LogoMaskShape } from '@/types';

const { Dragger } = Upload;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const MASK_SHAPES: { value: LogoMaskShape; label: string }[] = [
  { value: 'circle', label: '圆形' },
  { value: 'rounded', label: '圆角方形' },
];

export function LogoPanel() {
  const logo = useQRStore((s) => s.params.logo);
  const updateLogo = useQRStore((s) => s.updateLogo);
  const [uploading, setUploading] = useState(false);

  /** 读取文件为 Data URL */
  const processFile = useCallback(
    (file: File | Blob) => {
      if (file.type && !ALLOWED_TYPES.includes(file.type)) {
        message.warning('仅支持 PNG、JPEG、WebP 格式');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        message.warning('图片大小不能超过 5MB');
        return;
      }
      setUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        updateLogo({ imageDataUrl: reader.result as string, enabled: true });
        setUploading(false);
        message.success('Logo 上传成功');
      };
      reader.onerror = () => {
        message.error('图片读取失败，请重试');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    },
    [updateLogo],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customRequest = useCallback(
    (options: any) => {
      processFile(options.file as File);
      options.onSuccess?.('ok');
    },
    [processFile],
  );

  const handleChange = useCallback(
    (info: UploadChangeParam) => {
      const file = info.file.originFileObj;
      if (file && info.file.status === 'done' && !logo.imageDataUrl) {
        processFile(file);
      }
    },
    [processFile, logo.imageDataUrl],
  );

  const handleRemove = useCallback(() => {
    updateLogo({ imageDataUrl: null, enabled: false });
  }, [updateLogo]);

  return (
    <div>
      {!logo.imageDataUrl ? (
        <Form.Item>
          {uploading ? (
            <div className="flex items-center justify-center py-4" style={{ color: '#8E8E93', fontSize: 13 }}>
              正在处理图片...
            </div>
          ) : (
            <Dragger
              showUploadList={false}
              customRequest={customRequest}
              onChange={handleChange}
              accept={ALLOWED_TYPES.join(',')}
              style={{ padding: '16px 0' }}
            >
              <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
                <InboxOutlined style={{ fontSize: 24, color: '#8E8E93' }} />
              </p>
              <p style={{ color: '#8E8E93', fontSize: 12 }}>
                点击或拖拽上传 Logo 图片（PNG/JPEG/WebP，≤5MB）
              </p>
            </Dragger>
          )}
        </Form.Item>
      ) : (
        <>
          <Form.Item label="Logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={logo.imageDataUrl}
                alt="Logo 预览"
                style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #48484A' }}
              />
              <Upload
                showUploadList={false}
                customRequest={customRequest}
                onChange={handleChange}
                accept={ALLOWED_TYPES.join(',')}
              >
                <span style={{ color: '#7B7CFF', cursor: 'pointer', fontSize: 13 }}>更换图片</span>
              </Upload>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleRemove}
                style={{ color: '#FF453A', fontSize: 12 }}
              >
                移除
              </Button>
            </div>
          </Form.Item>

          <Form.Item label="Logo 大小">
            <Slider
              min={0.1}
              max={0.3}
              step={0.01}
              value={logo.sizeRatio}
              onChange={(v) => updateLogo({ sizeRatio: v })}
              tooltip={{ formatter: (v) => `${Math.round((v || 0.2) * 100)}%` }}
              marks={{ 0.1: '10%', 0.2: '20%', 0.3: '30%' }}
            />
          </Form.Item>

          <Form.Item label="遮罩形状">
            <Select
              value={logo.maskShape}
              onChange={(v) => updateLogo({ maskShape: v })}
              options={MASK_SHAPES}
            />
          </Form.Item>

          <Form.Item label="遮罩边距">
            <Slider
              min={0}
              max={20}
              value={logo.maskPadding}
              onChange={(v) => updateLogo({ maskPadding: v })}
              marks={{ 0: '0', 4: '4', 10: '10', 20: '20' }}
            />
          </Form.Item>

          <Form.Item label="遮罩背景色">
            <input
              type="color"
              value={logo.maskColor}
              onChange={(e) => updateLogo({ maskColor: e.target.value })}
              style={{ width: '100%', height: 36, cursor: 'pointer' }}
            />
          </Form.Item>
        </>
      )}
    </div>
  );
}
