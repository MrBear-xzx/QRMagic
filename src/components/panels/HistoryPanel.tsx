import { useState, useCallback, useEffect } from 'react';
import { Button, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import { useQRStore } from '@/store/useQRStore';
import { useAppMessage } from '@/hooks/useAppMessage';
import {
  loadHistory,
  deleteHistory,
  clearHistory,
  formatRelativeTime,
  type HistoryEntry,
} from '@/utils/historyStorage';

const { Text } = Typography;

/** 内容类型图标映射 */
const typeIcon: Record<string, string> = {
  text: '📝',
  url: '🔗',
  wifi: '📶',
  vcard: '👤',
  phone: '📞',
  email: '✉️',
};

/** 内容类型中文映射 */
const typeLabel: Record<string, string> = {
  text: '文本',
  url: '网址',
  wifi: 'WiFi',
  vcard: '名片',
  phone: '电话',
  email: '邮箱',
};

export function HistoryPanel() {
  const applyTemplate = useQRStore((s) => s.applyTemplate);
  const setTemplateId = useQRStore((s) => s.setTemplateId);
  const historyVersion = useQRStore((s) => s.historyVersion);
  const message = useAppMessage();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const refresh = useCallback(() => {
    setEntries(loadHistory());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, historyVersion]);

  /** 恢复记录 */
  const handleRestore = useCallback(
    (entry: HistoryEntry) => {
      applyTemplate({
        id: `history_${entry.id}`,
        name: `历史 · ${typeLabel[entry.contentType] || entry.contentType}`,
        description: entry.contentSummary,
        preview: '',
        params: entry.params,
      });
      setTemplateId(null); // 不标记为模板选中
      message.success('已恢复历史记录');
    },
    [applyTemplate, setTemplateId],
  );

  /** 删除单条 */
  const handleDelete = useCallback(
    (id: string) => {
      deleteHistory(id);
      refresh();
    },
    [refresh],
  );

  /** 清空全部 */
  const handleClear = useCallback(() => {
    clearHistory();
    setEntries([]);
    message.success('历史记录已清空');
  }, []);

  return (
    <div>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Text style={{ color: '#8E8E93', fontSize: 13 }}>暂无历史记录</Text>
          <br />
          <Text style={{ color: '#636366', fontSize: 11 }}>
            下载二维码时将自动保存
          </Text>
        </div>
      ) : (
        <>
          {/* 清空按钮 */}
          <div style={{ marginBottom: 8, textAlign: 'right' }}>
            <Popconfirm
              title="确定清空全部历史记录？"
              onConfirm={handleClear}
              okText="清空"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                style={{ color: '#8E8E93', fontSize: 12 }}
              >
                清空全部
              </Button>
            </Popconfirm>
          </div>

          {/* 记录列表 */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleRestore(entry)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 10px',
                  marginBottom: 4,
                  background: '#2C2C2E',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#3A3A3C';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#2C2C2E';
                }}
              >
                {/* 类型图标 */}
                <span style={{ fontSize: 20, marginRight: 8, flexShrink: 0 }}>
                  {typeIcon[entry.contentType] || '📝'}
                </span>

                {/* 内容摘要 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{ color: '#E5E5EA', fontSize: 13, fontWeight: 500 }}
                    ellipsis={{ tooltip: entry.contentSummary }}
                  >
                    {entry.contentSummary}
                  </Text>
                </div>

                {/* 时间 */}
                <Text style={{ color: '#636366', fontSize: 11, flexShrink: 0, marginRight: 6 }}>
                  {formatRelativeTime(entry.timestamp)}
                </Text>

                {/* 删除按钮 */}
                <Popconfirm
                  title="删除此记录？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDelete(entry.id);
                  }}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: '#8E8E93', flexShrink: 0 }}
                  />
                </Popconfirm>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
