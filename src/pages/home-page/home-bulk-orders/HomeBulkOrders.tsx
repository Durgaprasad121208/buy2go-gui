import React from 'react';
import { Row, Col, Button } from 'antd';
import { MessageCircle } from 'lucide-react';
import styles from './HomeBulkOrders.module.css';

export interface HomeBulkOrdersProps {
  /** Optional WhatsApp phone number (with country code, e.g. '919876543210') */
  whatsAppNumber?: string;
  /** Optional custom message for WhatsApp chat */
  whatsAppMessage?: string;
  /** Optional on-click callback */
  onChatClick?: () => void;
  /** Optional className */
  className?: string;
  /** Optional inline style */
  style?: React.CSSProperties;
}

/**
 * HomeBulkOrders - "NEED A LARGER RUN? BULK ORDERS, EVENT MERCH AND TEAM KITS."
 * Built with Ant Design grid and components matching the target design screenshot.
 */
export const HomeBulkOrders: React.FC<HomeBulkOrdersProps> = ({
  whatsAppNumber = '919876543210',
  whatsAppMessage = 'Hi Buy2Go! I need a quote for bulk orders / event merch.',
  onChatClick,
  className = '',
  style,
}) => {
  const handleWhatsAppAction = () => {
    if (onChatClick) {
      onChatClick();
      return;
    }

    const encodedMessage = encodeURIComponent(whatsAppMessage);
    const url = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={`${styles.section} ${className}`.trim()} style={style}>
      <div className={styles.container}>
        <Row
          align="middle"
          justify="space-between"
          gutter={[32, 28]}
          className={styles.row}
        >
          {/* Left Column: Tag, Headline, Description */}
          <Col xs={24} lg={17} className={styles.leftCol}>
            <span className={styles.tag}>NEED A LARGER RUN?</span>

            <h2 className={styles.title}>
              <span className={styles.titleLine}>BULK ORDERS, EVENT</span>
              <span className={styles.titleLine}>MERCH AND TEAM KITS.</span>
            </h2>

            <p className={styles.description}>
              Tell us what you need and we’ll help with quantities, artwork and print placement.
            </p>
          </Col>

          {/* Right Column: Chat on WhatsApp Button */}
          <Col xs={24} lg={7} className={styles.rightCol}>
            <Button
              className={styles.whatsappBtn}
              icon={<MessageCircle size={18} className={styles.btnIcon} />}
              onClick={handleWhatsAppAction}
              aria-label="Chat on WhatsApp about bulk orders"
            >
              Chat on WhatsApp
            </Button>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HomeBulkOrders;
