import { useCallback } from 'react';
import { Tooltip } from 'antd';
import { useQRStore } from '@/store/useQRStore';
import { builtinTemplates } from '@/templates';

export function TemplateBar() {
  const currentTemplateId = useQRStore((s) => s.currentTemplateId);
  const applyTemplate = useQRStore((s) => s.applyTemplate);

  const handleClick = useCallback(
    (id: string) => {
      const tpl = builtinTemplates.find((t) => t.id === id);
      if (tpl) {
        applyTemplate(tpl);
      }
    },
    [applyTemplate]
  );

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: '#8E8E93',
          marginBottom: 8,
          fontWeight: 500,
        }}
      >
        快速模板
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {builtinTemplates.map((tpl) => {
          const selected = currentTemplateId === tpl.id;
          return (
            <Tooltip key={tpl.id} title={tpl.description} placement="bottom">
              <button
                onClick={() => handleClick(tpl.id)}
                className="shrink-0 flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  width: 64,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  outline: 'none',
                }}
              >
                <div
                  className="rounded-lg overflow-hidden transition-shadow duration-200"
                  style={{
                    width: 56,
                    height: 56,
                    boxShadow: selected ? '0 0 0 2px #7B7CFF' : '0 0 0 1px #48484A',
                    background: '#2C2C2E',
                  }}
                >
                  {tpl.preview ? (
                    <img
                      src={tpl.preview}
                      alt={tpl.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center h-full"
                      style={{ fontSize: 10, color: '#8E8E93' }}
                    >
                      {tpl.name}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: selected ? '#7B7CFF' : '#8E8E93',
                    marginTop: 4,
                    fontWeight: selected ? 600 : 400,
                    maxWidth: 64,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                  }}
                >
                  {tpl.name}
                </span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
