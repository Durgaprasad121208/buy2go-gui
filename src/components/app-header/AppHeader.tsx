import React, { useState } from 'react';
import { Layout, Drawer } from 'antd';
import {
  ShoppingBag,
  LogOut,
  LogIn,
  User as UserIcon,
  LayoutDashboard,
  Menu,
  X,
  Search,
  ClipboardList,
  LayoutGrid,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DarkButton } from '../app-button/AppButton';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout, selectAuthUser, selectIsAdmin, selectIsAuthenticated } from '../../redux/slices/authSlice';
import { richNotify } from '../../utils/notify';
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
 * AppHeader - Main application header using Lucide React icons
 * Styled with single dark e-commerce theme and brand orange accents.
 * Fully responsive on Mobile, Tablet, and Desktop with mobile drawer navigation.
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
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (onLogoClick) {
      e.preventDefault();
      onLogoClick();
    }
  };

  const handleProductsClick = (e: React.MouseEvent) => {
    setMobileMenuOpen(false);
    if (onProductsClick) {
      e.preventDefault();
      onProductsClick();
    } else {
      navigate('/products');
    }
  };

  const handleSignOut = () => {
    setMobileMenuOpen(false);
    dispatch(logout());
    richNotify.success('Signed out successfully.');
    navigate('/login');
  };

  const handleMobileNav = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
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

        {/* Desktop Navigation Links */}
        <div className={styles.desktopNav}>
          <a
            href={productsHref}
            onClick={handleProductsClick}
            className={`${styles.navLink} ${
              location.pathname === '/products' ? styles.navLinkActive : ''
            }`}
          >
            Products
          </a>

          <a
            href="/track"
            onClick={(e) => {
              e.preventDefault();
              navigate('/track');
            }}
            className={`${styles.navLink} ${
              location.pathname.startsWith('/track') ? styles.navLinkActive : ''
            }`}
          >
            Track Order
          </a>

          <a
            href="/my-orders"
            onClick={(e) => {
              e.preventDefault();
              navigate('/my-orders');
            }}
            className={`${styles.navLink} ${
              location.pathname === '/my-orders' ? styles.navLinkActive : ''
            }`}
          >
            My Orders
          </a>

          {/* Admin Dashboard Quick Link for ROLE_ADMIN */}
          {isAdmin && (
            <a
              href="/admin/dashboard"
              onClick={(e) => {
                e.preventDefault();
                navigate('/admin/dashboard');
              }}
              className={styles.adminLink}
            >
              <LayoutDashboard size={14} />
              <span>Admin</span>
            </a>
          )}
        </div>

        {/* Right Actions (Cart, Auth, Mobile Menu Toggle) */}
        <div className={styles.headerRight}>
          <DarkButton
            onClick={onCartClick}
            className={styles.cartBtn}
            icon={<ShoppingBag size={16} className={styles.cartIcon} />}
          >
            <span className={styles.cartBtnText}>Cart</span>
            {typeof cartCount === 'number' && cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </DarkButton>

          {/* Desktop Sign In / Sign Out */}
          <div className={styles.desktopAuth}>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleSignOut}
                className={styles.authBtn}
                title={`Signed in as ${
                  user?.userName || user?.email || (isAdmin ? 'Admin' : 'Customer')
                }`}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            ) : (
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                className={styles.authBtn}
              >
                <LogIn size={16} />
                <span>Sign in</span>
              </a>
            )}
          </div>

          {extraRight}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </Header>

      {/* Mobile Drawer Navigation with Lucide Icons */}
      <Drawer
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        closable={false}
        className={styles.mobileDrawer}
        styles={{
          body: {
            backgroundColor: '#0D0907',
            padding: '24px 20px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
          wrapper: {
            maxWidth: '300px',
            width: '85%',
          },
        }}
      >
        <div>
          {/* Drawer Top Header with Logo & Close */}
          <div className={styles.drawerHeader}>
            <div className={styles.logoText}>
              <span className={styles.logoOrange}>{logoTextOrange}</span>
              <span className={styles.logoWhite}>{logoTextWhite}</span>
            </div>
            <button
              type="button"
              className={styles.drawerCloseBtn}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Greeting if Authenticated */}
          {isAuthenticated && (
            <div className={styles.drawerUserBox}>
              <div className={styles.drawerUserIcon}>
                <UserIcon size={18} />
              </div>
              <div>
                <div className={styles.drawerUserName}>
                  {user?.userName || user?.email?.split('@')[0] || 'Customer'}
                </div>
                <div className={styles.drawerUserRole}>
                  {isAdmin ? 'ADMINISTRATOR' : 'VERIFIED CUSTOMER'}
                </div>
              </div>
            </div>
          )}

          {/* Drawer Navigation Links */}
          <nav className={styles.drawerNav}>
            <button
              type="button"
              className={`${styles.drawerNavLink} ${
                location.pathname === '/products' ? styles.drawerNavLinkActive : ''
              }`}
              onClick={handleProductsClick}
            >
              <LayoutGrid size={18} className={styles.drawerNavIcon} />
              <span>Products</span>
            </button>

            <button
              type="button"
              className={`${styles.drawerNavLink} ${
                location.pathname.startsWith('/track') ? styles.drawerNavLinkActive : ''
              }`}
              onClick={() => handleMobileNav('/track')}
            >
              <Search size={18} className={styles.drawerNavIcon} />
              <span>Track Order</span>
            </button>

            <button
              type="button"
              className={`${styles.drawerNavLink} ${
                location.pathname === '/my-orders' ? styles.drawerNavLinkActive : ''
              }`}
              onClick={() => handleMobileNav('/my-orders')}
            >
              <ClipboardList size={18} className={styles.drawerNavIcon} />
              <span>My Orders</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                className={`${styles.drawerNavLink} ${styles.drawerAdminLink}`}
                onClick={() => handleMobileNav('/admin/dashboard')}
              >
                <LayoutDashboard size={18} className={styles.drawerNavIcon} />
                <span>Admin Dashboard</span>
              </button>
            )}

            <button
              type="button"
              className={styles.drawerNavLink}
              onClick={() => {
                setMobileMenuOpen(false);
                if (onCartClick) onCartClick();
                else navigate('/cart');
              }}
            >
              <ShoppingBag size={18} className={styles.drawerNavIcon} />
              <span>Your Cart</span>
              {typeof cartCount === 'number' && cartCount > 0 && (
                <span className={styles.drawerCartBadge}>{cartCount}</span>
              )}
            </button>
          </nav>
        </div>

        {/* Drawer Bottom Auth Section */}
        <div className={styles.drawerFooter}>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className={styles.drawerSignOutBtn}
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleMobileNav('/login')}
              className={styles.drawerSignInBtn}
            >
              <LogIn size={16} />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default AppHeader;
