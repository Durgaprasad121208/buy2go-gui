import React from 'react';
import { HomeHero } from './homepage-hero/HomeHero';

export interface HomePageProps {
  onExploreProductsClick?: () => void;
}

/**
 * HomePage - Main Landing Page for Buy2Go
 * Currently includes the HomeHero section with hero banner and 3-step value propositions.
 */
export const HomePage: React.FC<HomePageProps> = ({ onExploreProductsClick }) => {
  return (
    <div>
      <HomeHero onCtaClick={onExploreProductsClick} />
    </div>
  );
};

export default HomePage;
