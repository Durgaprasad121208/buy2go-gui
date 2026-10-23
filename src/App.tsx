import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import MainLayout from './components/app-layout/AppLayout';
import { HomePage } from './pages/home-page/HomePage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ProductInfo } from './pages/product-info/ProductInfo';
import { Cart } from './pages/cart-checkout/Cart';
import { AddProducts } from './pages/admin-pages/products/AddProducts';
import { AllOrders } from './pages/admin-pages/orders/AllOrders';
import { AdminDashboard } from './pages/admin-pages/dashboard/AdminDashboard';
import { TrackOrderPage } from './pages/orders/TrackOrderPage';
import { AuthPage } from './pages/auth/AuthPage';
import { useAppSelector } from './redux/hooks';
import { selectAuthUser, checkIsAdmin } from './redux/slices/authSlice';
import { richNotify } from './utils/notify';
import './App.css';

/**
 * Route Configuration Tables
 */
export const customerRoutes = [
  { path: 'products', element: ProductsPage },
  { path: 'product-info', element: ProductInfo },
  { path: 'product-info/:id', element: ProductInfo },
  { path: 'products/:id', element: ProductInfo },
  { path: 'cart', element: Cart },
  { path: 'checkout', element: Cart },
  { path: 'track', element: TrackOrderPage },
  { path: 'track/:orderNumber', element: TrackOrderPage },
  { path: 'my-orders', element: TrackOrderPage },
];

export const adminRoutes = [
  { path: 'admin', element: AdminDashboard },
  { path: 'admin/dashboard', element: AdminDashboard },
  { path: 'admin/products', element: AddProducts },
  { path: 'admin/orders', element: AllOrders },
];

/**
 * Route Guards
 */
interface RouteGuardProps {
  children: React.ReactElement;
}

export const PublicRoute: React.FC<RouteGuardProps> = ({ children }) => {
  return children;
};

export const ProtectedRoute: React.FC<RouteGuardProps> = ({ children }) => {
  return children;
};

export const AdminRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const user = useAppSelector(selectAuthUser);
  const cookieRole = (Cookies.get('role') || '').toUpperCase();
  const isAdmin = checkIsAdmin(user) || cookieRole.includes('ADMIN') || cookieRole.includes('OWNER');

  if (!isAdmin) {
    richNotify.warning('Access denied: Customer accounts cannot access the admin dashboard.');
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* 1. Public Standalone Routes (Sign In & Create Account) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthPage defaultMode="signin" />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthPage defaultMode="signup" />
          </PublicRoute>
        }
      />
      <Route path="/signin" element={<Navigate to="/login" replace />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />

      {/* 2. Main Application Routes wrapped in MainLayout (Header + Outlet + Footer) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Default index route: HomePage */}
        <Route index element={<HomePage />} />

        {/* Customer routes accessible to all shoppers */}
        {customerRoutes.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}

        {/* Protected Admin routes restricted to ROLE_ADMIN / ROLE_OWNER */}
        {adminRoutes.map(({ path, element: Element }) => (
          <Route
            key={path}
            path={path}
            element={
              <AdminRoute>
                <Element />
              </AdminRoute>
            }
          />
        ))}
      </Route>

      {/* 3. Global fallback for unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
