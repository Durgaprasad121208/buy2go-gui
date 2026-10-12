import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/app-layout/AppLayout';
import { HomePage } from './pages/home-page/HomePage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ProductInfo } from './pages/product-info/ProductInfo';
import { Cart } from './pages/cart-checkout/Cart';
import { AddProducts } from './pages/admin-pages/products/AddProducts';
import { AllOrders } from './pages/admin-pages/orders/AllOrders';
import './App.css';

/**
 * Route Configuration Table
 * Add new pages and feature routes here
 */
export const availableRoutes = [
  { path: 'products', element: ProductsPage },
  { path: 'product-info', element: ProductInfo },
  { path: 'product-info/:id', element: ProductInfo },
  { path: 'products/:id', element: ProductInfo },
  { path: 'cart', element: Cart },
  { path: 'checkout', element: Cart },
  { path: 'admin', element: AddProducts },
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
  // If user is already logged in, redirect to '/' if needed
  return children;
};

export const ProtectedRoute: React.FC<RouteGuardProps> = ({ children }) => {
  // Check auth token / state here
  return children;
};

function App() {
  return (
    <Routes>
      {/* 1. Public Standalone Routes (e.g. Login, Register) */}
      {/*
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      */}

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

        {/* Dynamic available routes mapping */}
        {availableRoutes.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      </Route>

      {/* 3. Global fallback for unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
