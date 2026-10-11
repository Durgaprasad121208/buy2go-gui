import React from 'react';
import { Row, Col } from 'antd';
import { Upload, Sparkles, Truck, ArrowRight, Check } from 'lucide-react';
import { SubmitButton } from '../../../components/app-button/AppButton';
import heroImage from '../../../assests/asset1.jpg';
import styles from './HomeHero.module.css';

export interface HomeHeroProps {
  /** CTA button text (default: 'Start your print') */
  ctaText?: string;
  /** Callback when CTA button is clicked */
  onCtaClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
}

/**
 * HomeHero - Main Hero component with Banner and 3-Step Feature Propositions Strip
 * Pixel-perfect match to the Buy2Go Custom Print Studio design.
 */
export const HomeHero: React.FC<HomeHeroProps> = ({
  ctaText = 'Start your print',
  onCtaClick,
  className = '',
  style,
}) => {
  return (
    <section className={`${styles.heroContainer} ${className}`.trim()} style={style}>
      {/* 1. Hero Main Banner */}
      <Row className={styles.heroBanner} align="stretch">
        {/* Left Column: Headline, Studio Tag, Description, CTA Row */}
        <Col xs={24} md={12} lg={13} className={styles.heroLeftCol}>
          {/* Studio Tag with Orange Dash */}
          <div className={styles.studioTag}>
            <span className={styles.studioLine} aria-hidden="true" />
            <span className={styles.studioText}>Custom Print Studio</span>
          </div>

          {/* Big Headline */}
          <h1 className={styles.heroTitle}>
            <span className={styles.titleWhite}>CLICK.</span>
            <span className={styles.titleOrange}>BUY. GO.</span>
          </h1>

          {/* Subtitle / Description */}
          <p className={styles.heroDescription}>
            Turn your artwork into premium tees, caps, mugs and key chains—printed
            with care and delivered to your door.
          </p>

          {/* CTA Row: Action Button + "No online payment needed" */}
          <div className={styles.ctaRow}>
            <SubmitButton
              onClick={onCtaClick}
              className={styles.ctaButton}
              icon={<ArrowRight size={18} />}
              iconPosition="end"
            >
              {ctaText}
            </SubmitButton>

            <div className={styles.paymentNote}>
              <Check size={16} className={styles.checkIcon} strokeWidth={2.5} />
              <span>No online payment needed</span>
            </div>
          </div>
        </Col>

        {/* Right Column: Hero Visual & "PRINT. PACK. DELIVER." Badge */}
        <Col xs={24} md={12} lg={11} className={styles.heroRightCol}>
          <div className={styles.heroImageWrapper}>
            <img
              src={heroImage}
              alt="Custom print apparel studio showcasing custom DTG printed t-shirt"
              className={styles.heroImage}
            />

            {/* Floating Badge */}
            <div className={styles.heroBadge}>
              <h4 className={styles.badgeTitle}>PRINT. PACK. DELIVER.</h4>
              <p className={styles.badgeSubtitle}>Made fresh for every order</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* 2. Feature Propositions Strip (01, 02, 03) */}
      <div className={styles.featuresStrip}>
        <Row>
          {/* Feature 01 */}
          <Col xs={24} md={8} className={styles.featureCol}>
            <div className={styles.featureCard}>
              <div className={styles.featureHeader}>
                <span className={styles.featureNumber}>01</span>
                <span className={styles.featureIcon}>
                  <Upload size={20} strokeWidth={2} />
                </span>
              </div>
              <h3 className={styles.featureTitle}>Share your artwork</h3>
              <p className={styles.featureDesc}>
                Upload a logo, photo or print-ready design.
              </p>
            </div>
          </Col>

          {/* Feature 02 */}
          <Col xs={24} md={8} className={styles.featureCol}>
            <div className={styles.featureCard}>
              <div className={styles.featureHeader}>
                <span className={styles.featureNumber}>02</span>
                <span className={styles.featureIcon}>
                  <Sparkles size={20} strokeWidth={2} />
                </span>
              </div>
              <h3 className={styles.featureTitle}>We print it fresh</h3>
              <p className={styles.featureDesc}>
                Each piece is made specifically for your order.
              </p>
            </div>
          </Col>

          {/* Feature 03 */}
          <Col xs={24} md={8} className={styles.featureCol}>
            <div className={styles.featureCard}>
              <div className={styles.featureHeader}>
                <span className={styles.featureNumber}>03</span>
                <span className={styles.featureIcon}>
                  <Truck size={20} strokeWidth={2} />
                </span>
              </div>
              <h3 className={styles.featureTitle}>Pay on delivery</h3>
              <p className={styles.featureDesc}>
                Check out without a card and pay at your door.
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HomeHero;
