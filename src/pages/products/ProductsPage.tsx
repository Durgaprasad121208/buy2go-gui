import React, { useState } from 'react';
import { Row, Col, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS_COLLECTION, ProductItem } from '../../data/products';
import homeStyles from '../home-page/home-products/HomeProducts.module.css';
import styles from './ProductsPage.module.css';

export interface ProductsPageProps {
  onProductSelect?: (product: ProductItem) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onProductSelect }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const handleCardClick = (product: ProductItem) => {
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      navigate(`/product-info/${product.id}`);
    }
  };

  const categories = ['ALL', 'APPAREL', 'DRINKWARE', 'ACCESSORIES'];

  const filteredProducts =
    selectedCategory === 'ALL'
      ? PRODUCTS_COLLECTION
      : PRODUCTS_COLLECTION.filter((p) => p.category === selectedCategory);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.pageHeader}>
          <span className={styles.categoryBreadcrumb}>CATALOGUE</span>
          <h1 className={styles.pageTitle}>ALL PRODUCTS</h1>
          <p className={styles.pageSubtitle}>
            Browse our full range of premium custom-printed apparel, drinkware, and accessories.
            Made fresh for every order with COD available.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className={styles.filterBar}>
          {categories.map((cat) => (
            <Button
              key={cat}
              className={`${styles.filterPill} ${
                selectedCategory === cat ? styles.filterPillActive : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <Row gutter={[24, 32]}>
          {filteredProducts.map((product) => (
            <Col key={product.id} xs={24} sm={12} lg={6}>
              <div
                className={homeStyles.cardWrapper}
                onClick={() => handleCardClick(product)}
                role="button"
                tabIndex={0}
              >
                <div className={homeStyles.imageContainer}>
                  <img
                    src={product.image}
                    alt={product.title}
                    className={homeStyles.productImage}
                  />
                </div>

                <div className={homeStyles.cardBody}>
                  <span className={homeStyles.categoryTag}>{product.category}</span>
                  <div className={homeStyles.titleRow}>
                    <h3 className={homeStyles.productTitle}>{product.title}</h3>
                    <Button
                      shape="circle"
                      className={homeStyles.arrowBtn}
                      icon={<ArrowRight size={16} />}
                      aria-label={`View ${product.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(product);
                      }}
                    />
                  </div>
                  <p className={homeStyles.priceText}>{product.formattedPrice}</p>
                </div>

                <div className={homeStyles.cardDivider} />
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ProductsPage;
