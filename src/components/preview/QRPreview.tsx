import { useRef, useCallback, useState, useEffect } from 'react';
import { Button, Space, Tooltip, Typography, message } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import { useQRStore } from '@/store/useQRStore';
import { useCanvasRenderer } from './useCanvasRenderer';

const { Text } = Typography;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function QRPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayScale, setDisplayScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const params = useQRStore((s) => s.params);
  const updateLogo = useQRStore((s) => s.updateLogo);
  const [isLogoDragOver, setIsLogoDragOver] = useState(false);
  const logoDragCounter = useRef(0);

  const { reRender } = useCanvasRenderer(canvasRef);

  // 缩放控制
  const zoomIn = useCallback(() => setDisplayScale((s) => Math.min(s + 0.2, 4)), []);
  const zoomOut = useCallback(() => setDisplayScale((s) => Math.max(s - 0.2, 0.3)), []);
  const zoomReset = useCallback(() => {
    setDisplayScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // 鼠标滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setDisplayScale((s) => Math.max(0.3, Math.min(4, s + delta)));
  }, []);

  // 拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // ===== Logo 拖拽上传 =====

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logoDragCounter.current += 1;
    if (logoDragCounter.current === 1) {
      setIsLogoDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logoDragCounter.current -= 1;
    if (logoDragCounter.current === 0) {
      setIsLogoDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLogoDragOver(false);
    logoDragCounter.current = 0;

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // 校验
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      message.warning('仅支持 PNG、JPEG、WebP 格式的 Logo 图片');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      message.warning('Logo 图片大小不能超过 5MB');
      return;
    }

    // 读取为 base64
    const reader = new FileReader();
    reader.onload = () => {
      updateLogo({ imageDataUrl: reader.result as string, enabled: true });
      message.success('Logo 已更新');
    };
    reader.onerror = () => {
      message.error('图片读取失败，请重试');
    };
    reader.readAsDataURL(file);
  }, [updateLogo]);

  // 键盘快捷键（仅在非输入框焦点时生效）
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        zoomReset();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        zoomIn();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [zoomIn, zoomOut, zoomReset]);

  const hasContent = params.content.text || params.content.url || params.content.phone || params.content.email;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full flex items-center justify-center overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Logo 拖拽高亮遮罩 */}
      {isLogoDragOver && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            zIndex: 20,
            background: 'rgba(94, 92, 230, 0.15)',
            border: '2px dashed #7B7CFF',
            borderRadius: 12,
            margin: 16,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#7B7CFF', fontSize: 18, fontWeight: 600 }}>
              📥 拖放 Logo 到此处
            </Text>
            <br />
            <Text style={{ color: '#8E8E93', fontSize: 12 }}>
              PNG / JPEG / WebP · 最大 5MB
            </Text>
          </div>
        </div>
      )}

      {/* QR 卡片 */}
      <div
        className="qr-card-shadow"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${displayScale})`,
          transition: isDragging ? 'none' : 'transform 300ms ease-out',
          transformOrigin: 'center center',
          borderRadius: 16,
          overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{ maxWidth: 640, height: 'auto' }}
        />
      </div>

      {/* 空状态提示 */}
      {!hasContent && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <Text style={{ color: '#8E8E93', fontSize: 15 }}>
            在左侧输入内容，二维码将在此实时预览
          </Text>
        </div>
      )}

      {/* 悬浮缩放控制 */}
      <div
        className="absolute flex items-center rounded-full overflow-hidden"
        style={{
          right: 24,
          bottom: 24,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        }}
      >
        <Tooltip title="缩小 (Ctrl+-)">
          <Button
            type="text"
            size="small"
            icon={<ZoomOutOutlined />}
            onClick={zoomOut}
            style={{ borderRadius: 0 }}
          />
        </Tooltip>
        <Tooltip title={`${Math.round(displayScale * 100)}%`}>
          <Button
            type="text"
            size="small"
            icon={<ExpandOutlined />}
            onClick={zoomReset}
            style={{ borderRadius: 0, color: '#5E5CE6' }}
          />
        </Tooltip>
        <Tooltip title="放大 (Ctrl+=)">
          <Button
            type="text"
            size="small"
            icon={<ZoomInOutlined />}
            onClick={zoomIn}
            style={{ borderRadius: 0 }}
          />
        </Tooltip>
      </div>
    </div>
  );
}
