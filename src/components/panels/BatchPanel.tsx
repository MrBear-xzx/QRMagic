import { useState, useRef, useCallback } from 'react';
import { Button, Progress, Table, Space, Typography, Upload } from 'antd';
import { UploadOutlined, DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { useQRStore } from '@/store/useQRStore';
import { useAppMessage } from '@/hooks/useAppMessage';
import { parseCsv, CSV_TEMPLATE, type CsvRow } from '@/utils/csvParser';
import { generateBatch } from '@/utils/batchGenerator';

const { Text } = Typography;

type BatchState = 'idle' | 'ready' | 'generating' | 'done' | 'cancelled';

export function BatchPanel() {
  const params = useQRStore((s) => s.params);
  const [state, setState] = useState<BatchState>('idle');
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [truncated, setTruncated] = useState(0);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const abortRef = useRef<AbortController | null>(null);
  const message = useAppMessage();

  /** 处理文件选择 */
  const handleFile = useCallback((file: RcFile) => {
    parseCsv(file)
      .then((result) => {
        if (result.rows.length === 0) {
          message.error('CSV 中没有有效数据行');
          setState('idle');
          return;
        }
        setRows(result.rows);
        setWarnings(result.warnings);
        setTruncated(result.truncated);
        setFileName(file.name);
        setState('ready');
        setProgress({ current: 0, total: 0 });
      })
      .catch((e) => {
        message.error(e instanceof Error ? e.message : 'CSV 解析失败');
      });
    return false; // 阻止 antd Upload 默认上传行为
  }, []);

  /** 生成 ZIP 并下载 */
  const handleGenerate = useCallback(async () => {
    if (rows.length === 0) return;

    const abort = new AbortController();
    abortRef.current = abort;
    setState('generating');
    setProgress({ current: 0, total: rows.length });

    try {
      const blob = await generateBatch(rows, params, (current, total) => {
        setProgress({ current, total });
      }, abort.signal);

      // 生成文件名
      const baseName = fileName.replace(/\.csv$/i, '');
      const zipName = `QRMagic_批量_${baseName}_${new Date().getTime()}.zip`;

      saveAs(blob, zipName);
      setState('done');
      message.success(`成功生成 ${rows.length} 个二维码！`);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setState('cancelled');
        message.info('已取消批量生成');
      } else {
        setState('idle');
        message.error(`生成失败：${e instanceof Error ? e.message : '未知错误'}`);
      }
    } finally {
      abortRef.current = null;
    }
  }, [rows, params, fileName]);

  /** 取消生成 */
  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** 重置状态 */
  const handleReset = useCallback(() => {
    setState('idle');
    setRows([]);
    setWarnings([]);
    setTruncated(0);
    setFileName('');
    setProgress({ current: 0, total: 0 });
    abortRef.current = null;
  }, []);

  /** 下载 CSV 模板 */
  const handleDownloadTemplate = useCallback(() => {
    const blob = new Blob(['﻿' + CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'QRMagic_导入模板.csv');
  }, []);

  // 预览表格列定义
  const previewColumns = [
    {
      title: '#',
      dataIndex: 'index',
      width: 40,
      render: (v: number) => <Text style={{ color: '#8E8E93' }}>{v}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 60,
      render: (v: string) => (
        <Text style={{ color: '#7B7CFF', fontSize: 12 }}>{typeLabel(v)}</Text>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (v: string) => <Text style={{ color: '#E5E5EA' }}>{v}</Text>,
    },
  ];

  const previewData = rows.slice(0, 5);

  const isGenerating = state === 'generating';
  const formatLabel = params.export.format === 'svg' ? 'SVG' : 'PNG';

  return (
    <div>
      {/* 使用说明 */}
      <div style={{ marginBottom: 12, padding: '8px 10px', background: '#2C2C2E', borderRadius: 6 }}>
        <Text style={{ color: '#8E8E93', fontSize: 11, lineHeight: 1.6, display: 'block' }}>
          CSV 格式：<b style={{ color: '#E5E5EA' }}>内容,类型</b>（类型留空自动识别）
          <br />
          支持：文本 · 网址 · WiFi · 名片 · 电话 · 邮箱
        </Text>
      </div>

      {/* 模板下载 */}
      {state === 'idle' && (
        <Button
          block
          onClick={handleDownloadTemplate}
          style={{
            background: '#3A3A3C',
            borderColor: '#48484A',
            color: '#E5E5EA',
            height: 36,
            marginBottom: 8,
          }}
        >
          📥 下载 CSV 模板
        </Button>
      )}

      {/* 文件上传 */}
      <Upload
        accept=".csv"
        showUploadList={false}
        beforeUpload={handleFile}
        disabled={isGenerating}
        style={{ width: '100%', display: 'block' }}
      >
        <Button
          icon={<UploadOutlined />}
          block
          disabled={isGenerating}
          style={{
            background: '#3A3A3C',
            borderColor: '#48484A',
            color: '#E5E5EA',
            height: 36,
          }}
        >
          {fileName ? `📎 ${fileName} (${rows.length} 条)` : '选择 CSV 文件'}
        </Button>
      </Upload>

      {/* 警告信息 */}
      {warnings.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {warnings.slice(0, 3).map((w, i) => (
            <Text key={i} style={{ color: '#FF9F0A', fontSize: 11, display: 'block' }}>
              ⚠ {w}
            </Text>
          ))}
          {warnings.length > 3 && (
            <Text style={{ color: '#8E8E93', fontSize: 11 }}>
              …还有 {warnings.length - 3} 条警告
            </Text>
          )}
        </div>
      )}

      {truncated > 0 && (
        <Text style={{ color: '#FF9F0A', fontSize: 11, display: 'block', marginTop: 4 }}>
          ⚠ 超过 200 条上限，已截断（舍弃 {truncated} 行）
        </Text>
      )}

      {/* 预览表格 */}
      {previewData.length > 0 && state !== 'generating' && (
        <div style={{ marginTop: 12 }}>
          <Text style={{ color: '#8E8E93', fontSize: 12 }}>
            预览（前 {Math.min(5, rows.length)} 行）
          </Text>
          <Table
            columns={previewColumns}
            dataSource={previewData}
            rowKey="index"
            size="small"
            pagination={false}
            style={{ marginTop: 4 }}
          />
        </div>
      )}

      {/* 格式说明 */}
      {state === 'ready' && (
        <div style={{ marginTop: 8 }}>
          <Text style={{ color: '#8E8E93', fontSize: 12 }}>
            输出格式：{formatLabel} · 预计生成 {rows.length} 个文件
          </Text>
        </div>
      )}

      {/* 进度条 */}
      {isGenerating && (
        <div style={{ marginTop: 12 }}>
          <Progress
            percent={Math.round((progress.current / progress.total) * 100)}
            format={() => `${progress.current}/${progress.total}`}
            strokeColor="#7B7CFF"
            trailColor="#3A3A3C"
          />
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ marginTop: 12 }}>
        {state === 'ready' || state === 'done' || state === 'cancelled' ? (
          <Space style={{ width: '100%' }} direction="vertical" size={8}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              block
              size="large"
              onClick={handleGenerate}
              style={{
                background: '#5E5CE6',
                borderColor: '#5E5CE6',
                height: 40,
                fontWeight: 600,
              }}
            >
              生成并下载 ZIP
            </Button>
            {state === 'done' && (
              <Text style={{ color: '#30D158', fontSize: 12 }}>✅ 生成完成</Text>
            )}
            {state === 'cancelled' && (
              <Text style={{ color: '#8E8E93', fontSize: 12 }}>已取消</Text>
            )}
            <Button
              type="text"
              block
              size="small"
              onClick={handleReset}
              style={{ color: '#8E8E93' }}
            >
              重新选择文件
            </Button>
          </Space>
        ) : isGenerating ? (
          <Button
            danger
            icon={<CloseOutlined />}
            block
            size="large"
            onClick={handleCancel}
            style={{ height: 40 }}
          >
            取消生成
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** 类型标签映射 */
function typeLabel(type: string): string {
  const map: Record<string, string> = {
    text: '文本',
    url: '网址',
    wifi: 'WiFi',
    vcard: '名片',
    phone: '电话',
    email: '邮箱',
  };
  return map[type] || type;
}
