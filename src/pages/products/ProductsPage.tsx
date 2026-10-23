import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductItem } from '../../data/products';
import { productService } from '../../services/productService';
import homeStyles from '../home-page/home-products/HomeProducts.module.css';
import styles from './ProductsPage.module.css';

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

export interface ProductsPageProps {
  onProductSelect?: (product: ProductItem) => void;
}

export const mapToProductItem = (p: any): ProductItem => ({
  id: String(p.id),
  title: p.title || p.name || 'Custom Product',
  category: (p.category || 'APPAREL').toUpperCase(),
  startingPrice: Number(p.price || p.startingPrice || 0),
  formattedPrice: p.formattedPrice || `From ₹${p.price || p.startingPrice || 0}`,
  image: p.image || p.imageUrl || p.photoUrl || DEFAULT_PRODUCT_IMAGE,
  description: p.description || '',
  slug: p.slug || (p.title || p.name || 'product').toLowerCase().replace(/\s+/g, '-'),
});

export const ProductsPage: React.FC<ProductsPageProps> = ({ onProductSelect }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await productService.getAllProducts();
        const data = (res as any)?.data || res;
        const rawList = Array.isArray(data) ? data : (data?.content || []);
        if (isMounted) {
          setProducts(rawList.map(mapToProductItem));
        }
      } catch (err) {
        console.error('Failed to load products from API:', err);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

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
      ? products
      : products.filter((p) => p.category === selectedCategory);

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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
            No products found in this category.
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
