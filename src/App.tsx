import React, { useState } from 'react';
import { AppLayout } from './components/app-layout/AppLayout';
import { HomePage } from './pages/home-page/HomePage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ProductItem } from './data/products';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'products'>('home');
  const [, setSelectedProduct] = useState<ProductItem | null>(null);

  const handleNavigateHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (currentPage === 'home' && productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentPage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProductSelect = (product: ProductItem) => {
    setSelectedProduct(product);
  };

  return (
    <AppLayout
      onNavigateHome={handleNavigateHome}
      onNavigateProducts={handleNavigateProducts}
      activePage={currentPage}
    >
      {currentPage === 'home' ? (
        <HomePage
          onExploreProductsClick={() => {
            const el = document.getElementById('products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onProductClick={handleProductSelect}
        />
      ) : (
        <ProductsPage onProductSelect={handleProductSelect} />
      )}
    </AppLayout>
  );
}

export default App;
