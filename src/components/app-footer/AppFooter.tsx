import React from 'react';
import { Layout } from 'antd';
import { MessageOutlined, InstagramOutlined } from '@ant-design/icons';
import styles from './AppFooter.module.css';

const { Footer } = Layout;

export interface AppFooterProps {
  /** Logo prefix in orange (default: 'BUY') */
  logoTextOrange?: string;
  /** Logo suffix in white (default: '2GO.IN') */
  logoTextWhite?: string;
  /** Brand tagline / bio */
  description?: string;
  /** Callback when 'All products' is clicked */
  onAllProductsClick?: () => void;
  /** Callback when 'Your cart' is clicked */
  onCartClick?: () => void;
  /** Callback when 'Shop owner login' is clicked */
  onShopOwnerLoginClick?: () => void;
  /** Callback when chat icon is clicked */
  onChatClick?: () => void;
  /** Callback when instagram icon is clicked */
  onInstagramClick?: () => void;
  /** Links */
  allProductsHref?: string;
  cartHref?: string;
  shopOwnerLoginHref?: string;
  chatHref?: string;
  instagramHref?: string;
  deliveryHref?: string;
  /** Bottom copyright line */
  copyrightText?: string;
  /** Bottom delivery text */
  deliveryText?: string;
  /** Additional CSS class */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
}

/**
 * AppFooter - Main application footer using Ant Design Layout.Footer
 * Perfectly aligned with the Buy2Go single dark theme.
 */
export const AppFooter: React.FC<AppFooterProps> = ({
  logoTextOrange = 'BUY',
  logoTextWhite = '2GO.IN',
  description = 'Quality custom printing for the things you wear, gift and use every day.',
  onAllProductsClick,
  onCartClick,
  onShopOwnerLoginClick,
  onChatClick,
  onInstagramClick,
  allProductsHref = '#products',
  cartHref = '#cart',
  shopOwnerLoginHref = '/login',
  chatHref = '#chat',
  instagramHref = 'https://instagram.com',
  deliveryHref = '#shipping',
  copyrightText = '© 2026 buy2go.in. Made to be yours.',
  deliveryText = 'Cash on delivery across India ↗',
  className = '',
  style,
}) => {
  return (
    <Footer className={`${styles.footer} ${className}`.trim()} style={style}>
      <div className={styles.container}>
        {/* Top 3-Column Section */}
        <div className={styles.topSection}>
          {/* Brand & Description */}
          <div className={styles.brandCol}>
            <a href="/" className={styles.logoContainer} aria-label="Buy2Go Home">
              <div className={styles.logoText}>
                <span className={styles.logoOrange}>{logoTextOrange}</span>
                <span className={styles.logoWhite}>{logoTextWhite}</span>
              </div>
            </a>
            <p className={styles.description}>{description}</p>
          </div>

          {/* SHOP Column */}
          <div>
            <h4 className={styles.colTitle}>SHOP</h4>
            <ul className={styles.linkList}>
              <li>
                <a
                  href={allProductsHref}
                  onClick={(e) => {
                    if (onAllProductsClick) {
                      e.preventDefault();
                      onAllProductsClick();
                    }
                  }}
                  className={styles.footerLink}
                >
                  All products
                </a>
              </li>
              <li>
                <a
                  href={cartHref}
                  onClick={(e) => {
                    if (onCartClick) {
                      e.preventDefault();
                      onCartClick();
                    }
                  }}
                  className={styles.footerLink}
                >
                  Your cart
                </a>
              </li>
              <li>
                <a
                  href={shopOwnerLoginHref}
                  onClick={(e) => {
                    if (onShopOwnerLoginClick) {
                      e.preventDefault();
                      onShopOwnerLoginClick();
                    }
                  }}
                  className={styles.footerLink}
                >
                  Shop owner login
                </a>
              </li>
            </ul>
          </div>

          {/* TALK TO US Column */}
          <div>
            <h4 className={styles.colTitle}>TALK TO US</h4>
            <div className={styles.socialRow}>
              <a
                href={chatHref}
                onClick={(e) => {
                  if (onChatClick) {
                    e.preventDefault();
                    onChatClick();
                  }
                }}
                className={styles.socialBtn}
                aria-label="Chat with us"
              >
                <MessageOutlined />
              </a>
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (onInstagramClick) {
                    e.preventDefault();
                    onInstagramClick();
                  }
                }}
                className={styles.socialBtn}
                aria-label="Visit our Instagram"
              >
                <InstagramOutlined />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>{copyrightText}</p>
          <a href={deliveryHref} className={styles.deliveryNote}>
            {deliveryText}
          </a>
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter;
