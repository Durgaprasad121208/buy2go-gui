import React from 'react';
import { HomeHero } from './homepage-hero/HomeHero';
import { HomeProducts } from './home-products/HomeProducts';
import { ProductItem } from '../../data/products';

export interface HomePageProps {
  onExploreProductsClick?: () => void;
  onProductClick?: (product: ProductItem) => void;
}

/**
 * HomePage - Main Landing Page for Buy2Go
 * Includes HomeHero (Panoramic Banner + 3-step value propositions)
 * followed by HomeProducts ("CHOOSE YOUR CANVAS" 4-item Collection).
 */
export const HomePage: React.FC<HomePageProps> = ({
  onExploreProductsClick,
  onProductClick,
}) => {
  return (
    <div>
      <HomeHero onCtaClick={onExploreProductsClick} />
      <HomeProducts onProductClick={onProductClick} />
    </div>
  );
};

export default HomePage;
