import React, { useState, useEffect } from 'react';
import { Input, Row, Col, Tag, Button, Empty, Spin, Popconfirm } from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    DownloadOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import { Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { richNotify } from '../../../utils/notify';
import { SubmitButton } from '../../../components/app-button/AppButton';
import { orderService } from '../../../services/orderService';
import {
    OrderStatus,
    CustomerDetail,
    OrderItemDetail,
    ShipmentDetail,
    Buy2GoOrder,
} from '../../../interfaces';
import styles from './AllOrders.module.css';

export interface OrderRecord {
    id: string;
    orderNumber: string;
    customerName: string;
    timestamp: string;
    location: string;
    itemCount: number;
    totalAmount: number;
    status: OrderStatus;
    customer: CustomerDetail;
    items: OrderItemDetail[];
    shipment: ShipmentDetail;
}

export const mapToOrderRecord = (dto: any): OrderRecord => {
    const customer = dto.customer || {};
    const shipment = dto.shipment || {};
    const items: OrderItemDetail[] = Array.isArray(dto.items)
        ? dto.items.map((it: any, idx: number) => ({
              id: String(it.id || `item-${idx}`),
              title: it.title || it.name || 'Custom Product',
              variant: it.variant || it.color || 'Standard',
              quantity: Number(it.quantity || 1),
              price: Number(it.price || 0),
              photos: Array.isArray(it.photos) && it.photos.length > 0
                  ? it.photos
                  : it.photo ? [it.photo] : [],
          }))
        : [];

    const formattedDate = dto.createdAt
        ? new Date(dto.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
          })
        : dto.timestamp || 'Recent';

    const orderNumberStr = dto.orderNumber
        ? dto.orderNumber.startsWith('#') ? dto.orderNumber : `#${dto.orderNumber}`
        : `#${String(dto.id).slice(-8)}`;

    return {
        id: String(dto.id),
        orderNumber: orderNumberStr,
        customerName: dto.customerName || customer.name || 'Customer',
        timestamp: formattedDate,
        location: dto.location || customer.address || 'India',
        itemCount: Number(
            dto.itemCount ||
            items.reduce((sum, it) => sum + (it.quantity || 1), 0) ||
            items.length
        ),
        totalAmount: Number(dto.totalAmount || 0),
        status: (dto.status || 'New') as OrderStatus,
        customer: {
            name: customer.name || dto.customerName || 'Customer',
            phone: customer.phone || 'N/A',
            address: customer.address || dto.location || 'N/A',
        },
        items,
        shipment: {
            status: (shipment.status || dto.status || 'New') as OrderStatus,
            courier: shipment.courier || '',
            trackingNumber: shipment.trackingNumber || '',
            notes: shipment.notes || '',
        },
    };
};

const STATUS_PILL_OPTIONS: OrderStatus[] = [
    'New',
    'Confirmed',
    'Printing',
    'Shipped',
    'Delivered',
    'Cancelled',
];

export const AllOrders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [savedFeedback, setSavedFeedback] = useState<Record<string, boolean>>({});

    const fetchOrders = async (statusFilter?: string, search?: string) => {
        try {
            setLoading(true);
            const params: any = {
                page: 0,
                size: 50,
            };
            if (statusFilter && statusFilter !== 'All') {
                params.status = statusFilter;
            }
            if (search && search.trim()) {
                params.search = search.trim();
            }

            const res = await orderService.getAllOrders(params);
            const data = (res as any)?.data || res;
            const rawList = Array.isArray(data) ? data : (data?.content || []);
            const mapped = rawList.map(mapToOrderRecord);
            setOrders(mapped);
            if (mapped.length > 0 && !expandedOrderId) {
                setExpandedOrderId(mapped[0].id);
            }
        } catch (err: any) {
            console.error('Failed to load orders from server:', err);
            richNotify.error('Could not load orders from server.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Calculate live count per status
    const filterCounts = {
        All: orders.length,
        New: orders.filter((o) => o.status === 'New').length,
        Confirmed: orders.filter((o) => o.status === 'Confirmed').length,
        Printing: orders.filter((o) => o.status === 'Printing').length,
        Shipped: orders.filter((o) => o.status === 'Shipped').length,
        Delivered: orders.filter((o) => o.status === 'Delivered').length,
        Cancelled: orders.filter((o) => o.status === 'Cancelled').length,
    };

    const filterOptions = [
        { label: 'All', count: filterCounts.All },
        { label: 'New', count: filterCounts.New },
        { label: 'Confirmed', count: filterCounts.Confirmed },
        { label: 'Printing', count: filterCounts.Printing },
        { label: 'Shipped', count: filterCounts.Shipped },
        { label: 'Delivered', count: filterCounts.Delivered },
        { label: 'Cancelled', count: filterCounts.Cancelled },
    ];

    // Filtered orders
    const filteredOrders = orders.filter((o) => {
        const matchesFilter =
            activeFilter === 'All' || o.status.toLowerCase() === activeFilter.toLowerCase();
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
            !query ||
            o.orderNumber.toLowerCase().includes(query) ||
            o.customerName.toLowerCase().includes(query) ||
            (o.customer.phone && o.customer.phone.includes(query)) ||
            (o.location && o.location.toLowerCase().includes(query));
        return matchesFilter && matchesSearch;
    });

    const handleToggleExpand = (orderId: string) => {
        setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    };

    const handleUpdateShipmentStatus = async (orderId: string, nextStatus: OrderStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, {
                status: nextStatus,
                remarks: `Updated status to ${nextStatus}`,
            });
            setOrders((prev) =>
                prev.map((o) => {
                    if (o.id === orderId) {
                        return {
                            ...o,
                            status: nextStatus,
                            shipment: { ...o.shipment, status: nextStatus },
                        };
                    }
                    return o;
                })
            );
            richNotify.success(`Order status updated to "${nextStatus}".`);
        } catch (err: any) {
            console.error('Failed to update status on server:', err);
            const errorMsg = err?.data?.message || err?.message || 'Server error';
            richNotify.error(`Status update failed: ${errorMsg}`);
        }
    };

    const handleShipmentInputChange = (
        orderId: string,
        field: 'courier' | 'trackingNumber' | 'notes',
        value: string
    ) => {
        setOrders((prev) =>
            prev.map((o) => {
                if (o.id === orderId) {
                    return {
                        ...o,
                        shipment: { ...o.shipment, [field]: value },
                    };
                }
                return o;
            })
        );
        setSavedFeedback((prev) => ({ ...prev, [orderId]: false }));
    };

    const handleSaveShipment = async (orderId: string) => {
        const target = orders.find((o) => o.id === orderId);
        if (!target) return;

        try {
            await orderService.updateShipment(orderId, {
                status: target.shipment.status,
                courier: target.shipment.courier,
                trackingNumber: target.shipment.trackingNumber,
                notes: target.shipment.notes,
            });
            setSavedFeedback((prev) => ({ ...prev, [orderId]: true }));
            richNotify.success('Shipment details saved successfully.');
        } catch (err: any) {
            console.error('Failed to save shipment details:', err);
            const errorMsg = err?.data?.message || err?.message || 'Server error';
            richNotify.error(`Failed to save shipment: ${errorMsg}`);
        }
    };

    const [exporting, setExporting] = useState<boolean>(false);

    const handleExportExcel = async () => {
        try {
            setExporting(true);
            const statusParam = activeFilter === 'All' ? undefined : activeFilter;
            await orderService.downloadOrdersExcel(statusParam);
            richNotify.success('Orders Excel report downloaded successfully.');
        } catch (err: any) {
            console.error('Failed to download Excel report:', err);
            const errorMsg = err?.data?.message || err?.message || 'Download failed';
            richNotify.error(`Export failed: ${errorMsg}`);
        } finally {
            setExporting(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            await orderService.cancelOrder(orderId, 'Cancelled by admin from dashboard');
            setOrders((prev) =>
                prev.map((o) => {
                    if (o.id === orderId) {
                        return {
                            ...o,
                            status: 'Cancelled' as OrderStatus,
                            shipment: { ...o.shipment, status: 'Cancelled' as OrderStatus },
                        };
                    }
                    return o;
                })
            );
            richNotify.success('Order cancelled successfully.');
        } catch (err: any) {
            console.error('Failed to cancel order:', err);
            const errorMsg = err?.data?.message || err?.message || 'Server error';
            richNotify.error(`Failed to cancel order: ${errorMsg}`);
        }
    };

    const handleDownloadPhoto = async (photoUrl: string, orderNumber: string, index?: number) => {
        try {
            richNotify.info('Downloading customer photo...');
            const suffix = typeof index === 'number' ? `_photo_${index + 1}` : '_photo';
            await orderService.downloadPhotoByUrl(photoUrl, `${orderNumber}${suffix}.jpg`);
            richNotify.success('Photo downloaded successfully.');
        } catch (err: any) {
            console.error('Failed to download photo:', err);
            richNotify.error('Could not download photo.');
        }
    };

    return (
        <div className={styles.ordersContainer}>
            <div className={styles.contentWrapper}>
                {/* Top Header Section */}
                <div className={styles.headerTop}>
                    <div>
                        <span className={styles.ownerTag}>OWNER DASHBOARD</span>
                        <h1 className={styles.pageTitle}>ORDERS & SHIPMENTS</h1>
                    </div>
                </div>

                {/* Tabs Navigation (DASHBOARD / ORDERS / PRODUCTS) */}
                <div className={styles.tabsNav}>
                    <button
                        type="button"
                        className={styles.tabItem}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        DASHBOARD
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabItem} ${styles.tabItemActive}`}
                    >
                        ORDERS
                    </button>
                    <button
                        type="button"
                        className={styles.tabItem}
                        onClick={() => navigate('/admin/products')}
                    >
                        PRODUCTS
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <Row gutter={[14, 14]} className={styles.metricsRow}>
                    <Col xs={12} sm={6}>
                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>NEW</div>
                            <div className={styles.metricValue}>{filterCounts.New}</div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>PRINTING</div>
                            <div className={styles.metricValue}>{filterCounts.Printing}</div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>SHIPPED</div>
                            <div className={styles.metricValue}>{filterCounts.Shipped}</div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>DELIVERED</div>
                            <div className={styles.metricValue}>{filterCounts.Delivered}</div>
                        </div>
                    </Col>
                </Row>

                {/* Filter Pills & Search Bar */}
                <div className={styles.controlsBar}>
                    {/* Status Pills (Horizontally swipeable on mobile) */}
                    <div className={styles.filterPillsStrip}>
                        {filterOptions.map((opt) => {
                            const isActive = activeFilter === opt.label;
                            return (
                                <Button
                                    key={opt.label}
                                    type={isActive ? 'primary' : 'default'}
                                    onClick={() => setActiveFilter(opt.label)}
                                    className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ''
                                        }`}
                                >
                                    {opt.label} ({opt.count})
                                </Button>
                            );
                        })}
                    </div>

                    {/* Search Box & Refresh Action */}
                    <div className={styles.searchActionRow}>
                        <Input
                            prefix={<SearchOutlined style={{ color: '#6E6E77' }} />}
                            placeholder="Name, phone or order no."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        <button
                            type="button"
                            className={styles.refreshBtn}
                            onClick={() => {
                                fetchOrders(activeFilter === 'All' ? undefined : activeFilter, searchQuery);
                                richNotify.info('Refreshed orders.');
                            }}
                        >
                            <ReloadOutlined />
                            <span>Refresh</span>
                        </button>
                        <button
                            type="button"
                            className={styles.refreshBtn}
                            onClick={handleExportExcel}
                            disabled={exporting}
                        >
                            <DownloadOutlined />
                            <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
                        </button>
                    </div>
                </div>

                {/* Orders List with Click-to-Expand Detail View / Empty Filter State */}
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <Empty
                            image={
                                <div className={styles.emptyIcon}>
                                    <Package size={46} color="#FF5E00" strokeWidth={1.8} />
                                </div>
                            }
                            description={
                                <span className={styles.emptyText}>
                                    No orders match this filter.
                                </span>
                            }
                            className={styles.emptyStateContainer}
                        />
                    ) : (
                        filteredOrders.map((ord) => {
                            const isExpanded = expandedOrderId === ord.id;
                            return (
                                <div
                                    key={ord.id}
                                    className={`${styles.orderCard} ${isExpanded ? styles.orderCardExpanded : ''
                                        }`}
                                >
                                    {/* Clickable Header Row */}
                                    <div
                                        className={styles.orderCardHeader}
                                        onClick={() => handleToggleExpand(ord.id)}
                                        role="button"
                                        tabIndex={0}
                                        aria-expanded={isExpanded}
                                    >
                                        <div>
                                            <div className={styles.orderHeaderLine}>
                                                {ord.orderNumber} · {ord.customerName}
                                            </div>
                                            <div className={styles.orderSubLine}>
                                                {ord.timestamp} · {ord.location} · {ord.itemCount} item
                                            </div>
                                        </div>

                                        <div className={styles.orderRight}>
                                            <span className={styles.orderPrice}>₹{ord.totalAmount}</span>
                                            <Tag className={styles.statusTag}>
                                                {ord.status.toUpperCase()}
                                            </Tag>
                                        </div>
                                    </div>

                                    {/* Expanded Details Body */}
                                    {isExpanded && (
                                        <div className={styles.expansionBody}>
                                            <Row gutter={[32, 24]}>
                                                {/* Left Column: Customer & Items */}
                                                <Col xs={24} lg={11}>
                                                    {/* Customer Information */}
                                                    <div className={styles.customerBlock}>
                                                        <span className={styles.sectionLabel}>CUSTOMER</span>
                                                        <div className={styles.customerName}>
                                                            {ord.customer.name}
                                                        </div>
                                                        <p className={styles.customerInfo}>
                                                            {ord.customer.phone}
                                                            <br />
                                                            {ord.customer.address}
                                                        </p>
                                                    </div>

                                                    {/* Ordered Items */}
                                                    <div>
                                                        <span className={styles.sectionLabel}>ITEMS</span>
                                                        {ord.items.map((item) => (
                                                            <div key={item.id} className={styles.itemsBox}>
                                                                <div className={styles.itemTitle}>
                                                                    {item.title} × {item.quantity}
                                                                </div>
                                                                <div className={styles.itemVariant}>
                                                                    {item.variant}
                                                                </div>

                                                                {/* Uploaded Customer Photos Thumbnail Gallery */}
                                                                {item.photos && item.photos.length > 0 && (
                                                                    <div className={styles.photoGallery}>
                                                                        {item.photos.map((photo, pIdx) => (
                                                                            <div
                                                                                key={pIdx}
                                                                                className={styles.photoThumb}
                                                                            >
                                                                                <img
                                                                                    src={photo}
                                                                                    alt={`Customer upload ${pIdx + 1}`}
                                                                                    className={styles.photoImg}
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    className={styles.photoDownloadBtn}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDownloadPhoto(photo, ord.orderNumber, pIdx);
                                                                                    }}
                                                                                    title="Download photo"
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
                                                </Col>

                                                {/* Right Column: Status & Shipment Management */}
                                                <Col xs={24} lg={13}>
                                                    <div className={styles.shipmentHeader}>
                                                        <Truck size={16} className={styles.truckIcon} />
                                                        <span>STATUS & SHIPMENT</span>
                                                    </div>

                                                    {/* Status Pills Selector */}
                                                    <div className={styles.shipmentStatusStrip}>
                                                        {STATUS_PILL_OPTIONS.map((statusOpt) => {
                                                            const currentShipmentStatus = ord.shipment?.status || ord.status || 'New';
                                                            const isStatusActive =
                                                                currentShipmentStatus.toLowerCase() ===
                                                                statusOpt.toLowerCase();
                                                            return (
                                                                <button
                                                                    key={statusOpt}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleUpdateShipmentStatus(ord.id, statusOpt)
                                                                    }
                                                                    className={`${styles.shipmentStatusBtn} ${isStatusActive ? styles.shipmentStatusActive : ''
                                                                        }`}
                                                                >
                                                                    {statusOpt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Courier Field */}
                                                    <div className={styles.formGroup}>
                                                        <label className={styles.fieldLabel}>COURIER</label>
                                                        <Input
                                                            className={styles.darkInput}
                                                            value={ord.shipment.courier}
                                                            placeholder="Courier partner name"
                                                            onChange={(e) =>
                                                                handleShipmentInputChange(
                                                                    ord.id,
                                                                    'courier',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {/* Tracking Number Field */}
                                                    <div className={styles.formGroup}>
                                                        <label className={styles.fieldLabel}>
                                                            TRACKING NUMBER
                                                        </label>
                                                        <Input
                                                            className={styles.darkInput}
                                                            value={ord.shipment.trackingNumber}
                                                            placeholder=""
                                                            onChange={(e) =>
                                                                handleShipmentInputChange(
                                                                    ord.id,
                                                                    'trackingNumber',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {/* Shipment Notes Field */}
                                                    <div className={styles.formGroup}>
                                                        <label className={styles.fieldLabel}>
                                                            SHIPMENT NOTES
                                                        </label>
                                                        <Input.TextArea
                                                            className={styles.darkTextArea}
                                                            rows={3}
                                                            value={ord.shipment.notes}
                                                            placeholder=""
                                                            onChange={(e) =>
                                                                handleShipmentInputChange(
                                                                    ord.id,
                                                                    'notes',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {/* Saved Feedback Message */}
                                                    {savedFeedback[ord.id] && (
                                                        <div className={styles.savedFeedback}>Saved.</div>
                                                    )}

                                                    {/* Save and Cancel Actions */}
                                                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                                        <SubmitButton
                                                            onClick={() => handleSaveShipment(ord.id)}
                                                            style={{
                                                                flex: 1,
                                                                height: 44,
                                                                borderRadius: 4,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            Save shipment
                                                        </SubmitButton>
                                                        {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                                                            <Popconfirm
                                                                title="Cancel Order"
                                                                description={`Are you sure you want to cancel order ${ord.orderNumber}?`}
                                                                okText="Yes, Cancel"
                                                                cancelText="No"
                                                                okButtonProps={{ danger: true }}
                                                                onConfirm={() => handleCancelOrder(ord.id)}
                                                            >
                                                                <Button
                                                                    danger
                                                                    icon={<CloseCircleOutlined />}
                                                                    style={{
                                                                        height: 44,
                                                                        borderRadius: 4,
                                                                        fontWeight: 700,
                                                                        backgroundColor: 'transparent',
                                                                        borderColor: '#ff4d4f',
                                                                        color: '#ff4d4f',
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </Popconfirm>
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllOrders;
