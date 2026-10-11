import React from 'react';
import { Layout } from 'antd';
import { AppHeader } from '../app-header/AppHeader';
import { AppFooter } from '../app-footer/AppFooter';
import styles from './AppLayout.module.css';

const { Content } = Layout;

export interface AppLayoutProps {
  children?: React.ReactNode;
}

/**
 * AppLayout (MainLayout) - Fixed Header at top, Footer at bottom,
 * and page components passed and rendered dynamically in the middle.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Layout className={styles.layout}>
      <AppHeader />
      <Content className={styles.content}>
        {children}
      </Content>
      <AppFooter />
    </Layout>
  );
};

export const MainLayout = AppLayout;
export default AppLayout;
