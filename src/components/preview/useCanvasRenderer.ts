import { useEffect, useRef, useCallback } from 'react';
import { useQRStore } from '@/store/useQRStore';
import { buildQrData, encodeQRMatrix } from '@/encoder/qrEncoder';
import { renderQRCode } from '@/renderer';

/** Canvas 渲染 Hook：监听参数变化，实时重绘 */
export function useCanvasRenderer(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const params = useQRStore((s) => s.params);
  const renderIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const doRender = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderId = ++renderIdRef.current;
    const data = buildQrData(params.content);

    // 空内容时清除 Canvas
    if (!data.trim()) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 1;
        canvas.height = 1;
      }
      return;
    }

    try {
      const matrix = await encodeQRMatrix(data, params.errorCorrection.level);
      // 防止过期渲染覆盖最新结果
      if (renderId !== renderIdRef.current) return;
      // 防止组件卸载后绘制
      if (!isMountedRef.current) return;

      await renderQRCode({ canvas, matrix, params });
    } catch (err) {
      console.error('QR 渲染失败:', err);
      // 清除 Canvas 显示错误状态
      if (isMountedRef.current && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = 1;
          canvas.height = 1;
        }
      }
    }
  }, [canvasRef, params]);

  useEffect(() => {
    isMountedRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      doRender();
    }, 300);

    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [doRender]);

  return { reRender: doRender };
}
