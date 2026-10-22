import { notification } from 'antd';

export interface NotifyOptions {
  description?: string;
  key?: string;
  duration?: number;
}

export const richNotify = {
  success: (message: string, options?: NotifyOptions) => {
    notification.success({
      message,
      description: options?.description,
      key: options?.key,
      duration: options?.duration ?? 3.5,
    });
  },
  error: (message: string, options?: NotifyOptions) => {
    notification.error({
      message,
      description: options?.description,
      key: options?.key,
      duration: options?.duration ?? 4,
    });
  },
  info: (message: string, options?: NotifyOptions) => {
    notification.info({
      message,
      description: options?.description,
      key: options?.key,
      duration: options?.duration ?? 3.5,
    });
  },
  warning: (message: string, options?: NotifyOptions) => {
    notification.warning({
      message,
      description: options?.description,
      key: options?.key,
      duration: options?.duration ?? 3.5,
    });
  },
};

export default richNotify;
