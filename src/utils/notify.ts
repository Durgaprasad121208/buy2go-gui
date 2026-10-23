import React from 'react';
import { notification } from 'antd';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface NotifyOptions {
  description?: string;
  key?: string;
  duration?: number;
}

const baseNotificationStyle: React.CSSProperties = {
  backgroundColor: '#14100E',
  borderRadius: 8,
  boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.8), 0 0 16px rgba(255, 94, 0, 0.12)',
  color: '#FFFFFF',
  padding: '14px 18px',
};

const renderMessage = (message: string) =>
  React.createElement('span', { style: { color: '#FFFFFF', fontWeight: 700, fontSize: 14 } }, message);

const renderDescription = (description?: string) =>
  description
    ? React.createElement('span', { style: { color: '#B5AEA4', fontSize: 13, marginTop: 2, display: 'block' } }, description)
    : undefined;

const closeBtn = React.createElement(X, { size: 16, style: { color: '#8C867E' } });

export const richNotify = {
  success: (message: string, options?: NotifyOptions) => {
    notification.open({
      message: renderMessage(message),
      description: renderDescription(options?.description),
      icon: React.createElement(CheckCircle2, { size: 20, color: '#FF5E00' }),
      closeIcon: closeBtn,
      style: {
        ...baseNotificationStyle,
        border: '1px solid rgba(255, 94, 0, 0.45)',
      },
      duration: options?.duration ?? 3.5,
      key: options?.key,
    });
  },
  error: (message: string, options?: NotifyOptions) => {
    notification.open({
      message: renderMessage(message),
      description: renderDescription(options?.description),
      icon: React.createElement(AlertCircle, { size: 20, color: '#EF4444' }),
      closeIcon: closeBtn,
      style: {
        ...baseNotificationStyle,
        border: '1px solid rgba(239, 68, 68, 0.45)',
      },
      duration: options?.duration ?? 4,
      key: options?.key,
    });
  },
  info: (message: string, options?: NotifyOptions) => {
    notification.open({
      message: renderMessage(message),
      description: renderDescription(options?.description),
      icon: React.createElement(Info, { size: 20, color: '#FF5E00' }),
      closeIcon: closeBtn,
      style: {
        ...baseNotificationStyle,
        border: '1px solid rgba(255, 94, 0, 0.35)',
      },
      duration: options?.duration ?? 3.5,
      key: options?.key,
    });
  },
  warning: (message: string, options?: NotifyOptions) => {
    notification.open({
      message: renderMessage(message),
      description: renderDescription(options?.description),
      icon: React.createElement(AlertTriangle, { size: 20, color: '#F59E0B' }),
      closeIcon: closeBtn,
      style: {
        ...baseNotificationStyle,
        border: '1px solid rgba(245, 158, 11, 0.45)',
      },
      duration: options?.duration ?? 3.5,
      key: options?.key,
    });
  },
};

export default richNotify;
