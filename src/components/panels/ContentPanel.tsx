import { useCallback } from 'react';
import { Select, Input, Form, InputNumber } from 'antd';
import { useQRStore } from '@/store/useQRStore';
import type { ContentType, WiFiEncryption } from '@/types';

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'text', label: '文本' },
  { value: 'url', label: '网址' },
  { value: 'vcard', label: '名片' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'phone', label: '电话号码' },
  { value: 'email', label: '邮箱' },
];

export function ContentPanel() {
  const content = useQRStore((s) => s.params.content);
  const setContentType = useQRStore((s) => s.setContentType);
  const updateContent = useQRStore((s) => s.updateContent);

  const renderForm = () => {
    switch (content.type) {
      case 'text':
        return (
          <>
            <Form.Item label="文本内容">
              <Input.TextArea
                rows={3}
                value={content.text}
                onChange={(e) => updateContent({ text: e.target.value })}
                placeholder="输入要生成二维码的文本内容"
              />
            </Form.Item>
            <div
              style={{
                fontSize: 12,
                color: '#FF9F0A',
                background: 'rgba(255, 159, 10, 0.1)',
                border: '1px solid rgba(255, 159, 10, 0.25)',
                borderRadius: 6,
                padding: '6px 10px',
                lineHeight: 1.5,
              }}
            >
              ⚠️ 微信扫一扫不支持展示二维码中的中文
            </div>
          </>
        );
      case 'url':
        return (
          <Form.Item label="网址">
            <Input
              value={content.url}
              onChange={(e) => updateContent({ url: e.target.value })}
              placeholder="输入网址，如 example.com"
              addonBefore="🔗"
            />
          </Form.Item>
        );
      case 'vcard':
        return (
          <>
            <Form.Item label="姓名">
              <Input
                value={content.vcardName}
                onChange={(e) => updateContent({ vcardName: e.target.value })}
                placeholder="姓名"
              />
            </Form.Item>
            <Form.Item label="电话">
              <Input
                value={content.vcardPhone}
                onChange={(e) => updateContent({ vcardPhone: e.target.value })}
                placeholder="电话号码"
              />
            </Form.Item>
            <Form.Item label="邮箱">
              <Input
                value={content.vcardEmail}
                onChange={(e) => updateContent({ vcardEmail: e.target.value })}
                placeholder="邮箱地址"
              />
            </Form.Item>
            <Form.Item label="公司">
              <Input
                value={content.vcardCompany}
                onChange={(e) => updateContent({ vcardCompany: e.target.value })}
                placeholder="公司名称"
              />
            </Form.Item>
            <Form.Item label="职位">
              <Input
                value={content.vcardTitle}
                onChange={(e) => updateContent({ vcardTitle: e.target.value })}
                placeholder="职位"
              />
            </Form.Item>
          </>
        );
      case 'wifi':
        return (
          <>
            <Form.Item label="WiFi 名称 (SSID)">
              <Input
                value={content.wifiSsid}
                onChange={(e) => updateContent({ wifiSsid: e.target.value })}
                placeholder="网络名称"
              />
            </Form.Item>
            <Form.Item label="密码">
              <Input.Password
                value={content.wifiPassword}
                onChange={(e) => updateContent({ wifiPassword: e.target.value })}
                placeholder="WiFi 密码"
              />
            </Form.Item>
            <Form.Item label="加密方式">
              <Select
                value={content.wifiEncryption || 'WPA'}
                onChange={(v) => updateContent({ wifiEncryption: v as WiFiEncryption })}
                options={[
                  { value: 'WPA', label: 'WPA/WPA2' },
                  { value: 'WEP', label: 'WEP' },
                  { value: 'nopass', label: '无密码' },
                ]}
              />
            </Form.Item>
          </>
        );
      case 'phone':
        return (
          <Form.Item label="电话号码">
            <Input
              value={content.phone}
              onChange={(e) => updateContent({ phone: e.target.value })}
              placeholder="输入电话号码"
              addonBefore="📞"
            />
          </Form.Item>
        );
      case 'email':
        return (
          <>
            <Form.Item label="邮箱地址">
              <Input
                value={content.email}
                onChange={(e) => updateContent({ email: e.target.value })}
                placeholder="example@mail.com"
              />
            </Form.Item>
            <Form.Item label="邮件主题">
              <Input
                value={content.emailSubject}
                onChange={(e) => updateContent({ emailSubject: e.target.value })}
                placeholder="可选"
              />
            </Form.Item>
            <Form.Item label="邮件正文">
              <Input.TextArea
                rows={2}
                value={content.emailBody}
                onChange={(e) => updateContent({ emailBody: e.target.value })}
                placeholder="可选"
              />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Form.Item label="内容类型">
        <Select
          value={content.type}
          onChange={(v) => setContentType(v)}
          options={CONTENT_TYPES}
        />
      </Form.Item>
      {renderForm()}
    </div>
  );
}
