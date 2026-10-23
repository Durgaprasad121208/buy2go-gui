import React, { useState, useEffect, useMemo } from 'react';
import { Spin, Input } from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ShoppingOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DownOutlined,
  UpOutlined,
  CopyOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Buy2GoOrder } from '../../interfaces';
import { useAppSelector } from '../../redux/hooks';
import { selectIsAuthenticated, selectAuthUser } from '../../redux/slices/authSlice';
import { richNotify } from '../../utils/notify';
import styles from './MyOrdersPage.module.css';

type FilterTab = 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED';

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  const [orders, setOrders] = useState<Buy2GoOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      const list = (res as any)?.data || res;
      if (Array.isArray(list)) {
        setOrders(list);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Failed to load my orders:', err);
      richNotify.error('Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleCopyOrderNumber = (e: React.MouseEvent, orderNumber: string) => {
    e.stopPropagation();
    const clean = orderNumber.replace(/^#/, '');
    navigator.clipboard.writeText(clean);
    richNotify.success(`Order number ${orderNumber} copied to clipboard.`);
  };

  const handleDownloadPhoto = async (
    e: React.MouseEvent,
    photoUrl: string,
    orderNumber: string,
    index?: number
  ) => {
    e.stopPropagation();
    try {
      richNotify.info('Downloading photo from MinIO...');
      const cleanNum = orderNumber.replace(/^#/, '');
      const suffix = typeof index === 'number' ? `_photo_${index + 1}` : '_photo';
      // User requested: pass the order id so GET /api/orders/download-photo?id=... streams from MinIO
      await orderService.downloadPhoto({
        id: cleanNum,
        url: photoUrl,
        fileName: `${cleanNum}${suffix}.jpg`,
      });
      richNotify.success('Photo downloaded successfully.');
    } catch (err) {
      console.error('Download photo error:', err);
      richNotify.error('Could not download photo.');
    }
  };

  const handleDownloadAllOrderPhotos = async (e: React.MouseEvent, ord: Buy2GoOrder) => {
    e.stopPropagation();
    try {
      richNotify.info('Downloading order photo...');
      const cleanNum = (ord.orderNumber || ord.id).replace(/^#/, '');
      await orderService.downloadPhoto({
        id: cleanNum,
        url: ord.photo,
        fileName: `${cleanNum}_custom_photo.jpg`,
      });
      richNotify.success('Photo downloaded successfully.');
    } catch (err) {
      console.error('Failed to download order photo:', err);
      richNotify.error('Could not download order photo.');
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Tab filter
      if (selectedTab === 'ACTIVE') {
        const isCompleted = ['Delivered', 'Cancelled'].includes(ord.status);
        if (isCompleted) return false;
      } else if (selectedTab === 'DELIVERED') {
        if (ord.status !== 'Delivered') return false;
      } else if (selectedTab === 'CANCELLED') {
        if (ord.status !== 'Cancelled') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesOrderNum = (ord.orderNumber || '').toLowerCase().includes(q);
        const matchesId = (ord.id || '').toLowerCase().includes(q);
        const matchesItems = (ord.items || []).some(
          (itm) =>
            (itm.title || '').toLowerCase().includes(q) ||
            (itm.variant || '').toLowerCase().includes(q) ||
            (itm.textToPrint || '').toLowerCase().includes(q)
        );
        const matchesCourier = (ord.shipment?.courier || '').toLowerCase().includes(q);
        const matchesTracking = (ord.shipment?.trackingNumber || '').toLowerCase().includes(q);

        return matchesOrderNum || matchesId || matchesItems || matchesCourier || matchesTracking;
      }

      return true;
    });
  }, [orders, selectedTab, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    const all = orders.length;
    const active = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status)).length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
    return { all, active, delivered, cancelled };
  }, [orders]);

  if (!isAuthenticated) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.authBanner}>
            <ShoppingOutlined style={{ fontSize: 44, color: '#FF5E00', marginBottom: 16 }} />
            <h2 className={styles.authBannerTitle}>Sign in to view your orders</h2>
            <p className={styles.authBannerSub}>
              Track live shipment progress, view purchase receipts, and download custom printed photos.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={styles.shopNowBtn}
                onClick={() => navigate('/login')}
              >
                Sign In to Account
              </button>
              <button
                type="button"
                className={styles.actionDownloadBtn}
                onClick={() => navigate('/track')}
              >
                Track by Order Number
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.headerSection}>
          <span className={styles.tag}>CUSTOMER PORTAL</span>
          <div className={styles.headerTopRow}>
            <div>
              <h1 className={styles.title}>MY ORDERS</h1>
              <p className={styles.subtitle}>
                Review past purchases, monitor delivery status in real-time, and download your customized item photos.
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.trackQuickBtn}
                onClick={() => navigate('/track')}
              >
                <SearchOutlined />
                <span>Track Order</span>
              </button>
              <button
                type="button"
                className={styles.refreshBtn}
                onClick={fetchOrders}
                title="Refresh orders list"
              >
                <ReloadOutlined spin={loading} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className={styles.controlsBar}>
          <div className={styles.tabsList}>
            <button
              type="button"
              className={`${styles.tabBtn} ${selectedTab === 'ALL' ? styles.tabBtnActive : ''}`}
              onClick={() => setSelectedTab('ALL')}
            >
              All Orders
              <span className={styles.tabCount}>{counts.all}</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${selectedTab === 'ACTIVE' ? styles.tabBtnActive : ''}`}
              onClick={() => setSelectedTab('ACTIVE')}
            >
              Active
              <span className={styles.tabCount}>{counts.active}</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${selectedTab === 'DELIVERED' ? styles.tabBtnActive : ''}`}
              onClick={() => setSelectedTab('DELIVERED')}
            >
              Delivered
              <span className={styles.tabCount}>{counts.delivered}</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${selectedTab === 'CANCELLED' ? styles.tabBtnActive : ''}`}
              onClick={() => setSelectedTab('CANCELLED')}
            >
              Cancelled
              <span className={styles.tabCount}>{counts.cancelled}</span>
            </button>
          </div>

          <div className={styles.searchInputWrapper}>
            <Input
              size="small"
              prefix={<SearchOutlined style={{ color: '#8C867E', fontSize: 11 }} />}
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#8C867E', fontSize: 14 }}>
              Loading your orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className={styles.emptyState}>
            <ShoppingOutlined className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>
              {searchQuery ? 'No matching orders found' : 'No orders in this tab'}
            </h3>
            <p className={styles.emptySubtitle}>
              {searchQuery
                ? `No orders matched your search "${searchQuery}". Try a different keyword.`
                : 'Browse our customizable catalog and create your first personalized merchandise today!'}
            </p>
            <button
              type="button"
              className={styles.shopNowBtn}
              onClick={() => navigate('/products')}
            >
              Explore Products
            </button>
          </div>
        ) : (
          /* Orders Cards List */
          <div className={styles.ordersList}>
            {filteredOrders.map((ord) => {
              const cleanNumber = ord.orderNumber ? ord.orderNumber.replace(/^#/, '') : ord.id;
              const displayOrderNumber = ord.orderNumber?.startsWith('#')
                ? ord.orderNumber
                : `#${cleanNumber}`;
              const formattedDate = ord.createdAt
                ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recently Placed';

              const hasCustomPhotos =
                (ord.items || []).some((i) => i.photos && i.photos.length > 0) ||
                Boolean(ord.photo) ||
                (ord.photos && ord.photos.length > 0);

              const isExpanded = Boolean(expandedOrders[ord.id]);

              return (
                <div key={ord.id} className={styles.orderCard}>
                  {/* Clickable Header - Collapsed by default */}
                  <div
                    className={`${styles.cardHeader} ${isExpanded ? styles.cardHeaderOpen : ''}`}
                    onClick={() => toggleExpand(ord.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                  >
                    <div className={styles.cardHeaderLeft}>
                      <span className={styles.orderNumBadge}>{displayOrderNumber}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyOrderNumber(e, displayOrderNumber)}
                        title="Copy order number"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#8C867E',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                      >
                        <CopyOutlined />
                      </button>
                      <span className={styles.orderDate}>{formattedDate}</span>
                    </div>

                    <div className={styles.cardHeaderRight}>
                      <span className={styles.orderItemsCount}>
                        {ord.itemCount || ord.items?.length || 1} item
                        {(ord.itemCount || ord.items?.length || 1) > 1 ? 's' : ''}
                      </span>
                      <span className={styles.orderTotalAmount}>₹{ord.totalAmount}</span>
                      <span className={styles.chevronIcon}>
                        {isExpanded ? <UpOutlined /> : <DownOutlined />}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Card Body - Closed by Default */}
                  {isExpanded && (
                    <div className={styles.collapsibleBody}>
                      {/* Shipment Quick Info Strip */}
                      {ord.shipment && (ord.shipment.courier || ord.shipment.trackingNumber) && (
                        <div className={styles.shipmentStrip}>
                          <span className={styles.shipmentCourier}>
                            <CarOutlined style={{ color: '#FF5E00' }} />
                            <span>Courier: {ord.shipment.courier || 'Standard Dispatch'}</span>
                          </span>
                          {ord.shipment.trackingNumber && (
                            <span className={styles.shipmentTracking}>
                              Tracking ID: <strong>{ord.shipment.trackingNumber}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Body - Items */}
                      <div className={styles.cardBody}>
                        <div className={styles.itemsList}>
                          {(ord.items || []).map((itm, itmIdx) => (
                            <div key={itm.id || itmIdx} className={styles.itemRow}>
                              <div className={styles.itemMain}>
                                {itm.photo ? (
                                  <img
                                    src={itm.photo}
                                    alt={itm.title}
                                    className={styles.itemThumb}
                                  />
                                ) : (
                                  <div className={styles.itemThumbPlaceholder}>
                                    <ShoppingOutlined />
                                  </div>
                                )}
                                <div className={styles.itemDetails}>
                                  <div className={styles.itemTitle}>{itm.title}</div>
                                  <div className={styles.itemVariant}>
                                    {itm.variant || 'Standard'} {itm.color ? `· ${itm.color}` : ''}
                                  </div>
                                  {itm.textToPrint && (
                                    <span className={styles.itemCustomText}>
                                      Print: &ldquo;{itm.textToPrint}&rdquo;
                                    </span>
                                  )}
                                  {itm.printNotes && (
                                    <div style={{ fontSize: 11, color: '#8C867E', marginTop: 2 }}>
                                      Note: {itm.printNotes}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className={styles.itemPriceQty}>
                                ₹{itm.price} × {itm.quantity}
                              </div>

                              {/* Custom Photos attached to this item */}
                              {itm.photos && itm.photos.length > 0 && (
                                <div className={styles.photosStrip} style={{ width: '100%' }}>
                                  <span className={styles.photosLabel}>Your Custom Photos:</span>
                                  {itm.photos.map((photo, pIdx) => (
                                    <div key={pIdx} className={styles.photoThumbBox}>
                                      <img
                                        src={photo}
                                        alt={`Custom upload ${pIdx + 1}`}
                                        className={styles.photoThumbImg}
                                      />
                                      <button
                                        type="button"
                                        className={styles.photoDownloadBtn}
                                        onClick={(e) =>
                                          handleDownloadPhoto(e, photo, cleanNumber, pIdx)
                                        }
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

                      {/* Expandable Order Details - Address & Payment */}
                      <div className={styles.expandedDetails}>
                        <div>
                          <div className={styles.detailColTitle}>Shipping Details</div>
                          <div className={styles.detailColContent}>
                            <strong>{ord.customer?.name || ord.customerName}</strong>
                            <br />
                            {ord.customer?.phone}
                            <br />
                            {ord.customer?.address || ord.location}
                          </div>
                        </div>

                        <div>
                          <div className={styles.detailColTitle}>Delivery Status</div>
                          <div className={styles.detailColContent}>
                            Status: <strong>{ord.status}</strong>
                            <br />
                            Courier: {ord.shipment?.courier || 'Pending'}
                            <br />
                            Tracking: {ord.shipment?.trackingNumber || 'Pending assignment'}
                            {ord.shipment?.notes && (
                              <>
                                <br />
                                Notes: {ord.shipment.notes}
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className={styles.detailColTitle}>Payment & Timeline</div>
                          <div className={styles.detailColContent}>
                            Total: <strong>₹{ord.totalAmount}</strong> (Cash on Delivery / Prepaid)
                            <br />
                            Placed: {formattedDate}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className={styles.cardFooter}>
                        <div className={styles.cardFooterLeft}>
                          <button
                            type="button"
                            className={styles.detailsToggleBtn}
                            onClick={() => toggleExpand(ord.id)}
                          >
                            <UpOutlined /> Collapse
                          </button>
                        </div>

                        <div className={styles.cardFooterRight}>
                          {hasCustomPhotos && (
                            <button
                              type="button"
                              className={styles.actionDownloadBtn}
                              onClick={(e) => handleDownloadAllOrderPhotos(e, ord)}
                              title="Download high-resolution photo from MinIO"
                            >
                              <DownloadOutlined />
                              <span>Download Photo</span>
                            </button>
                          )}

                          <button
                            type="button"
                            className={styles.actionTrackBtn}
                            onClick={() => navigate(`/track/${cleanNumber}`)}
                          >
                            <CarOutlined />
                            <span>Track Live</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
