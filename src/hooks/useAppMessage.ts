import { App } from 'antd';

/** 从 App 上下文获取 message 实例，避免静态方法警告 */
export function useAppMessage() {
  const { message } = App.useApp();
  return message;
}
