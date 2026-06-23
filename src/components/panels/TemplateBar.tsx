import { useState, useCallback, useRef } from 'react';
import { Tooltip, message, Input, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useQRStore } from '@/store/useQRStore';
import { builtinTemplates } from '@/templates';
import {
  loadCustomTemplates,
  saveCustomTemplate,
  renameCustomTemplate,
  deleteCustomTemplate,
} from '@/utils/templateStorage';
import type { Template } from '@/types';

export function TemplateBar() {
  const currentTemplateId = useQRStore((s) => s.currentTemplateId);
  const params = useQRStore((s) => s.params);
  const applyTemplate = useQRStore((s) => s.applyTemplate);
  const [manageMode, setManageMode] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<Template[]>(() => loadCustomTemplates());
  const nameRef = useRef('');

  // 合并内置 + 自定义模板
  const allTemplates = [...builtinTemplates, ...customTemplates];

  /** 应用模板 */
  const handleApply = useCallback(
    (tpl: Template) => {
      if (manageMode) return;
      applyTemplate(tpl);
    },
    [applyTemplate, manageMode],
  );

  /** 保存当前参数为模板 */
  const handleSave = useCallback(() => {
    nameRef.current = '';
    Modal.confirm({
      title: '保存为模板',
      content: (
        <Input
          placeholder="输入模板名称"
          maxLength={20}
          onChange={(e) => { nameRef.current = e.target.value; }}
          style={{ marginTop: 8 }}
          autoFocus
        />
      ),
      okText: '保存',
      cancelText: '取消',
      onOk: () => {
        if (!nameRef.current.trim()) {
          message.warning('模板名称不能为空');
          return Promise.reject();
        }
        try {
          saveCustomTemplate(nameRef.current.trim(), params);
          setCustomTemplates(loadCustomTemplates());
          message.success('模板已保存');
        } catch (e) {
          message.error(e instanceof Error ? e.message : '保存失败');
          return Promise.reject();
        }
      },
    });
  }, [params]);

  /** 重命名 */
  const handleRename = useCallback((tpl: Template) => {
    nameRef.current = tpl.name;
    Modal.confirm({
      title: '重命名模板',
      content: (
        <Input
          defaultValue={tpl.name}
          placeholder="输入新名称"
          maxLength={20}
          onChange={(e) => { nameRef.current = e.target.value; }}
          style={{ marginTop: 8 }}
          autoFocus
        />
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        if (!nameRef.current.trim()) {
          message.warning('名称不能为空');
          return Promise.reject();
        }
        renameCustomTemplate(tpl.id, nameRef.current.trim());
        setCustomTemplates(loadCustomTemplates());
        message.success('已重命名');
      },
    });
  }, []);

  /** 删除 */
  const handleDelete = useCallback((tpl: Template) => {
    Modal.confirm({
      title: `删除模板「${tpl.name}」？`,
      content: '删除后不可恢复',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        deleteCustomTemplate(tpl.id);
        setCustomTemplates(loadCustomTemplates());
        message.success('已删除');
      },
    });
  }, []);

  return (
    <div>
      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#8E8E93', fontWeight: 500 }}>
          快速模板
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="保存当前参数为模板">
            <button
              onClick={handleSave}
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                border: 'none',
                background: '#3A3A3C',
                color: '#8E8E93',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              <PlusOutlined />
            </button>
          </Tooltip>
          <Tooltip title={manageMode ? '退出管理' : '管理自定义模板'}>
            <button
              onClick={() => setManageMode(!manageMode)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                border: 'none',
                background: manageMode ? '#5E5CE6' : '#3A3A3C',
                color: manageMode ? '#FFFFFF' : '#8E8E93',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              <SettingOutlined />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="flex gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'thin' }}>
        {allTemplates.map((tpl) => {
          const selected = currentTemplateId === tpl.id;
          const isCustom = tpl.id.startsWith('custom_');
          const nameColor = isCustom ? '#7B7CFF' : '#8E8E93';

          return (
            <Tooltip key={tpl.id} title={tpl.description} placement="bottom">
              <button
                onClick={() => handleApply(tpl)}
                className="shrink-0 flex flex-col items-center transition-all duration-200 hover:scale-105"
                style={{
                  width: 64,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  outline: 'none',
                  cursor: manageMode && isCustom ? 'default' : 'pointer',
                }}
              >
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    width: 56,
                    height: 56,
                    boxShadow: selected ? '0 0 0 2px #7B7CFF' : '0 0 0 1px #48484A',
                    background: isCustom ? '#1E1E2E' : '#2C2C2E',
                  }}
                >
                  <div
                    className="flex items-center justify-center h-full"
                    style={{
                      fontSize: 10,
                      color: nameColor,
                      padding: 4,
                      textAlign: 'center',
                      lineHeight: 1.3,
                    }}
                  >
                    {tpl.name}
                  </div>
                </div>

                {manageMode && isCustom ? (
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRename(tpl); }}
                      style={{ border: 'none', background: 'transparent', color: '#7B7CFF', cursor: 'pointer', padding: 0, fontSize: 13 }}
                    >
                      <EditOutlined />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(tpl); }}
                      style={{ border: 'none', background: 'transparent', color: '#FF453A', cursor: 'pointer', padding: 0, fontSize: 13 }}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: 10,
                      color: selected ? '#7B7CFF' : nameColor,
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
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
