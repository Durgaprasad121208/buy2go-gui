import React from 'react';
import { Row, Col, Button } from 'antd';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS_COLLECTION, ProductItem } from '../../../data/products';
import styles from './HomeProducts.module.css';

export interface HomeProductsProps {
  onProductClick?: (product: ProductItem) => void;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HomeProducts - "CHOOSE YOUR CANVAS" The Collection section
 * Built with Ant Design grid and components, pixel-perfect match to design screenshot.
 */
export const HomeProducts: React.FC<HomeProductsProps> = ({
  onProductClick,
  id = 'products-section',
  className = '',
  style,
}) => {
  return (
    <section id={id} className={`${styles.section} ${className}`.trim()} style={style}>
      <div className={styles.container}>
        {/* Section Header: Left Title + Right Description */}
        <Row
          justify="space-between"
          align="bottom"
          gutter={[24, 24]}
          className={styles.headerRow}
        >
          <Col xs={24} md={14} lg={12}>
            <span className={styles.label}>THE COLLECTION</span>
            <h2 className={styles.title}>
              <span className={styles.titleLine}>CHOOSE YOUR</span>
              <span className={styles.titleLine}>CANVAS</span>
            </h2>
          </Col>

          <Col xs={24} md={10} lg={10}>
            <p className={styles.description}>
              Premium blanks. Crisp colour. Your artwork at the centre of it all.
            </p>
          </Col>
        </Row>

        {/* 4 Product Cards Grid */}
        <Row gutter={[24, 32]} className={styles.productsRow}>
          {PRODUCTS_COLLECTION.map((product) => (
            <Col key={product.id} xs={24} sm={12} lg={6}>
              <div
                className={styles.cardWrapper}
                onClick={() => onProductClick?.(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onProductClick?.(product);
                  }
                }}
              >
                {/* Product Image Mockup */}
                <div className={styles.imageContainer}>
                  <img
                    src={product.image}
                    alt={product.title}
                    className={styles.productImage}
                    loading="lazy"
                  />
                </div>

                {/* Information Body */}
                <div className={styles.cardBody}>
                  <span className={styles.categoryTag}>{product.category}</span>

                  <div className={styles.titleRow}>
                    <h3 className={styles.productTitle}>{product.title}</h3>
                    <Button
                      shape="circle"
                      className={styles.arrowBtn}
                      icon={<ArrowRight size={16} />}
                      aria-label={`View details for ${product.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductClick?.(product);
                      }}
                    />
                  </div>

                  <p className={styles.priceText}>{product.formattedPrice}</p>
                </div>

                {/* Subtle Divider Line */}
                <div className={styles.cardDivider} />
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default HomeProducts;
