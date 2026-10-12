import React from 'react';
import { Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppHeader } from '../app-header/AppHeader';
import { AppFooter } from '../app-footer/AppFooter';
import styles from './AppLayout.module.css';

const { Content } = Layout;

export interface AppLayoutProps {
  children?: React.ReactNode;
  onNavigateHome?: () => void;
  onNavigateProducts?: () => void;
  activePage?: string;
}

/**
 * AppLayout (MainLayout) - Fixed Header at top, Footer at bottom,
 * and page components rendered in Content via children or React Router's <Outlet />.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  onNavigateHome,
  onNavigateProducts,
}) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProductsClick = () => {
    if (onNavigateProducts) {
      onNavigateProducts();
    } else {
      navigate('/products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout className={styles.layout}>
      <AppHeader
        onLogoClick={handleHomeClick}
        onProductsClick={handleProductsClick}
        onCartClick={handleCartClick}
      />
      <Content className={styles.content}>
        {children || <Outlet />}
      </Content>
      <AppFooter />
    </Layout>
  );
};

export const MainLayout = AppLayout;
export default AppLayout;
