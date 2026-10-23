import React, { useState, useEffect } from 'react';
import { Input, Spin, Empty, Button, Tag } from 'antd';
import {
  SearchOutlined,
  CheckCircleFilled,
  DownloadOutlined,
  CarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Buy2GoOrder, OrderStatus } from '../../interfaces';
import { SubmitButton } from '../../components/app-button/AppButton';
import { useAppSelector } from '../../redux/hooks';
import { selectIsAuthenticated } from '../../redux/slices/authSlice';
import { richNotify } from '../../utils/notify';
import styles from './TrackOrderPage.module.css';

const TRACKING_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'New', label: 'Order Placed' },
  { status: 'Confirmed', label: 'Confirmed' },
  { status: 'Printing', label: 'In Printing' },
  { status: 'Shipped', label: 'Shipped' },
  { status: 'Delivered', label: 'Delivered' },
];

const STATUS_ORDER_INDEX: Record<string, number> = {
  New: 0,
  Confirmed: 1,
  Printing: 2,
  Shipped: 3,
  Delivered: 4,
  Cancelled: -1,
};

export const TrackOrderPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [inputOrderNumber, setInputOrderNumber] = useState<string>(orderNumber || '');
  const [trackedOrder, setTrackedOrder] = useState<Buy2GoOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [myOrders, setMyOrders] = useState<Buy2GoOrder[]>([]);
  const [loadingMyOrders, setLoadingMyOrders] = useState<boolean>(false);

  const performTracking = async (numberToTrack: string) => {
    const cleaned = numberToTrack.trim().replace(/^#/, '');
    if (!cleaned) {
      richNotify.warning('Please enter an order number.');
      return;
    }

    try {
      setLoading(true);
      const res = await orderService.trackOrder(cleaned);
      const data = (res as any)?.data || res;
      if (data && (data.id || data.orderNumber)) {
        setTrackedOrder(data);
      } else {
        setTrackedOrder(null);
        richNotify.warning(`No order found matching "${numberToTrack}".`);
      }
    } catch (err: any) {
      console.error('Track order failed:', err);
      setTrackedOrder(null);
      richNotify.error(`Order "${numberToTrack}" not found.`);
    } finally {
      setLoading(false);
    }
  };

  // If orderNumber is present in URL, track immediately
  useEffect(() => {
    if (orderNumber) {
      setInputOrderNumber(orderNumber);
      performTracking(orderNumber);
    }
  }, [orderNumber]);

  // Load customer's past orders if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchMyOrders = async () => {
        try {
          setLoadingMyOrders(true);
          const res = await orderService.getMyOrders();
          const list = (res as any)?.data || res;
          if (Array.isArray(list)) {
            setMyOrders(list);
            if (!orderNumber && list.length > 0 && !trackedOrder) {
              setTrackedOrder(list[0]);
              setInputOrderNumber(list[0].orderNumber || list[0].id);
            }
          }
        } catch (err) {
          console.warn('Could not load customer past orders:', err);
        } finally {
          setLoadingMyOrders(false);
        }
      };
      fetchMyOrders();
    }
  }, [isAuthenticated]);

  const handleDownloadItemPhoto = async (photoUrl: string, itemTitle: string, index: number) => {
    try {
      richNotify.info('Downloading your photo...');
      await orderService.downloadPhotoByUrl(photoUrl, `${itemTitle.replace(/\s+/g, '_')}_photo_${index + 1}.jpg`);
      richNotify.success('Photo downloaded successfully.');
    } catch (err) {
      console.error('Download photo error:', err);
      richNotify.error('Could not download photo.');
    }
  };

  const currentStepIndex = trackedOrder
    ? STATUS_ORDER_INDEX[trackedOrder.status] ?? 0
    : 0;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.headerSection}>
          <span className={styles.tag}>REAL-TIME TRACKING</span>
          <h1 className={styles.title}>TRACK YOUR ORDER</h1>
          <p className={styles.subtitle}>
            Enter your order number or select from your recent purchases below to check live fulfillment and shipping status.
          </p>
        </div>

        {/* Search Input Box */}
        <div className={styles.trackerSearchCard}>
          <div className={styles.searchRow}>
            <Input
              prefix={<SearchOutlined style={{ color: '#8C867E' }} />}
              placeholder="e.g. #ORD-20261023 or 6ad9eab7..."
              value={inputOrderNumber}
              onChange={(e) => setInputOrderNumber(e.target.value)}
              onPressEnter={() => performTracking(inputOrderNumber)}
              className={styles.searchInput}
            />
            <SubmitButton
              onClick={() => performTracking(inputOrderNumber)}
              className={styles.trackBtn}
            >
              Track
            </SubmitButton>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        )}

        {/* Tracking Details View */}
        {!loading && trackedOrder && (
          <div className={styles.orderDetailCard}>
            <div className={styles.orderTopBar}>
              <div>
                <div className={styles.orderNumText}>
                  {trackedOrder.orderNumber?.startsWith('#')
                    ? trackedOrder.orderNumber
                    : `#${trackedOrder.orderNumber || trackedOrder.id}`}
                </div>
                <div className={styles.orderMetaText}>
                  Placed on {trackedOrder.createdAt ? new Date(trackedOrder.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }) : 'Recently'} · {trackedOrder.location || 'India'}
                </div>
              </div>
              <div className={styles.orderTotalBlock}>
                <div className={styles.totalLabel}>Total Amount</div>
                <div className={styles.totalValue}>
                  ₹{Number(trackedOrder.totalAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            {trackedOrder.status === 'Cancelled' ? (
              <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255, 77, 79, 0.1)', borderRadius: 6, marginBottom: 24 }}>
                <Tag color="red" style={{ fontSize: 14, padding: '4px 12px' }}>ORDER CANCELLED</Tag>
                <p style={{ color: '#ff4d4f', marginTop: 8, fontSize: 13 }}>
                  This order was cancelled. If you have questions, please reach out via WhatsApp support.
                </p>
              </div>
            ) : (
              <div className={styles.timelineSection}>
                <div className={styles.timelineTitle}>STATUS PROGRESSION</div>
                <div className={styles.stepsRow}>
                  {TRACKING_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const itemClass = isCurrent
                      ? styles.stepCurrent
                      : isCompleted
                      ? styles.stepCompleted
                      : '';

                    return (
                      <div key={step.status} className={`${styles.stepItem} ${itemClass}`}>
                        <div className={styles.stepCircle}>
                          {isCompleted ? <CheckCircleFilled /> : idx + 1}
                        </div>
                        <div className={styles.stepTitle}>{step.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipment Courier Banner */}
            {trackedOrder.shipment && (trackedOrder.shipment.courier || trackedOrder.shipment.trackingNumber) && (
              <div className={styles.shipmentBanner}>
                <div className={styles.shipmentBannerLeft}>
                  <CarOutlined className={styles.truckIcon} />
                  <div>
                    <div className={styles.shipmentTitle}>
                      {trackedOrder.shipment.courier || 'Standard Courier'}
                    </div>
                    <div className={styles.shipmentSub}>
                      Tracking Number: <strong style={{ color: '#FFFFFF' }}>{trackedOrder.shipment.trackingNumber || 'Pending'}</strong>
                      {trackedOrder.shipment.notes && ` · ${trackedOrder.shipment.notes}`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ordered Items List */}
            <div className={styles.itemsList}>
              <div className={styles.timelineTitle}>ORDER ITEMS</div>
              {(trackedOrder.items || []).map((item, idx) => (
                <div key={item.id || idx} className={styles.itemCard}>
                  <div className={styles.itemLeft}>
                    {item.photo && (
                      <img
                        src={item.photo}
                        alt={item.title}
                        className={styles.itemThumb}
                      />
                    )}
                    <div>
                      <div className={styles.itemTitle}>
                        {item.title} × {item.quantity}
                      </div>
                      <div className={styles.itemVariant}>
                        {item.variant || item.color || 'Standard'} · ₹{item.price} each
                      </div>
                    </div>
                  </div>

                  {/* Customer Uploaded Photos with Download */}
                  {item.photos && item.photos.length > 0 && (
                    <div className={styles.itemPhotosWrapper}>
                      <span style={{ fontSize: 11, color: '#8C867E', marginRight: 4 }}>Custom Photos:</span>
                      {item.photos.map((photo, pIdx) => (
                        <div key={pIdx} className={styles.photoMiniThumb}>
                          <img
                            src={photo}
                            alt={`Upload ${pIdx + 1}`}
                            className={styles.photoMiniImg}
                          />
                          <button
                            type="button"
                            className={styles.downloadMiniBtn}
                            onClick={() => handleDownloadItemPhoto(photo, item.title, pIdx)}
                            title="Download Photo"
                          >
                            <DownloadOutlined />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Orders (Customer Account) */}
        {isAuthenticated && myOrders.length > 0 && (
          <div className={styles.myOrdersSection}>
            <h2 className={styles.myOrdersTitle}>Your Past Orders</h2>
            <div className={styles.myOrdersGrid}>
              {myOrders.map((ord) => {
                const isActive = trackedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    className={`${styles.pastOrderCard} ${isActive ? styles.pastOrderCardActive : ''}`}
                    onClick={() => {
                      setTrackedOrder(ord);
                      setInputOrderNumber(ord.orderNumber || ord.id);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                  >
                    <div className={styles.pastOrderTop}>
                      <span className={styles.pastOrderNum}>
                        {ord.orderNumber?.startsWith('#') ? ord.orderNumber : `#${ord.orderNumber || ord.id}`}
                      </span>
                      <span
                        className={styles.pastOrderStatus}
                        style={{
                          backgroundColor: 'rgba(255, 94, 0, 0.15)',
                          color: '#FF5E00',
                        }}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <div className={styles.pastOrderBottom}>
                      <span>₹{ord.totalAmount}</span>
                      <span>
                        {ord.createdAt
                          ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : 'Recent'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
