'use client'

import React from 'react';
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#10b981', // สีหลัก (เขียว)
    colorBgContainer: '#ffffff',
    colorText: '#1e293b',
    colorBorder: '#e2e8f0',
  },
};

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={theme}>
      {children}
    </ConfigProvider>
  );
}