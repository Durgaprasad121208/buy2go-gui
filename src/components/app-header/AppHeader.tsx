import React from 'react';
import { Layout } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { DarkButton } from '../app-button/AppButton';
import styles from './AppHeader.module.css';

const { Header } = Layout;

export interface AppHeaderProps {
  logoTextOrange?: string;
  logoTextWhite?: string;
  cartCount?: number;
  onLogoClick?: () => void;
  onProductsClick?: () => void;
  onCartClick?: () => void;
  logoHref?: string;
  productsHref?: string;
  extraRight?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AppHeader - Main application header using Ant Design Layout.Header
 * Styled with single dark e-commerce theme and brand orange accents.
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  logoTextOrange = 'BUY',
  logoTextWhite = '2GO.IN',
  cartCount,
  onLogoClick,
  onProductsClick,
  onCartClick,
  logoHref,
  productsHref = '#products',
  extraRight,
  className = '',
  style,
}) => {
  const handleLogoClick = (e: React.MouseEvent) => {
    if (onLogoClick) {
      e.preventDefault();
      onLogoClick();
    }
  };

  const handleProductsClick = (e: React.MouseEvent) => {
    if (onProductsClick) {
      e.preventDefault();
      onProductsClick();
    }
  };

  return (
    <Header className={`${styles.header} ${className}`.trim()} style={style}>
      {/* Brand Logo */}
      <a
        href={logoHref || '/'}
        onClick={handleLogoClick}
        className={styles.logoContainer}
        aria-label="Buy2Go Home"
      >
        <div className={styles.logoText}>
          <span className={styles.logoOrange}>{logoTextOrange}</span>
          <span className={styles.logoWhite}>{logoTextWhite}</span>
        </div>
      </a>

      {/* Right Navigation & Cart */}
      <div className={styles.navActions}>
        <a
          href={productsHref}
          onClick={handleProductsClick}
          className={styles.navLink}
        >
          Products
        </a>

        <DarkButton
          onClick={onCartClick}
          className={styles.cartBtn}
          icon={<ShoppingOutlined className={styles.cartIcon} />}
        >
          <span>Cart</span>
          {typeof cartCount === 'number' && cartCount > 0 && (
            <span className={styles.cartBadge}>{cartCount}</span>
          )}
        </DarkButton>

        {extraRight}
      </div>
    </Header>
  );
};

export default AppHeader;
