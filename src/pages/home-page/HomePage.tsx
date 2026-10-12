import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeHero } from './homepage-hero/HomeHero';
import { HomeProducts } from './home-products/HomeProducts';
import { HomeBulkOrders } from './home-bulk-orders/HomeBulkOrders';
import { ProductItem } from '../../data/products';

export interface HomePageProps {
  onExploreProductsClick?: () => void;
  onProductClick?: (product: ProductItem) => void;
  onBulkChatClick?: () => void;
}

/**
 * HomePage - Main Landing Page for Buy2Go
 * 1. HomeHero (Panoramic Banner + 3-step value propositions)
 * 2. HomeProducts ("CHOOSE YOUR CANVAS" 4-item Collection)
 * 3. HomeBulkOrders ("BULK ORDERS, EVENT MERCH AND TEAM KITS.")
 */
export const HomePage: React.FC<HomePageProps> = ({
  onExploreProductsClick,
  onProductClick,
  onBulkChatClick,
}) => {
  const navigate = useNavigate();

  const handleCta = () => {
    if (onExploreProductsClick) {
      onExploreProductsClick();
    } else {
      const el = document.getElementById('products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/products');
      }
    }
  };

  const handleProduct = (product: ProductItem) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      navigate(`/product-info/${product.id}`);
    }
  };

  return (
    <div>
      <HomeHero onCtaClick={handleCta} />
      <HomeProducts onProductClick={handleProduct} />
      <HomeBulkOrders onChatClick={onBulkChatClick} />
    </div>
  );
};

export default HomePage;
