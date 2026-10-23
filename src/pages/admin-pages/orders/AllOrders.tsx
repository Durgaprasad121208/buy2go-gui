import React, { useState } from 'react';
import { Input, Row, Col, Tag, Button, Empty } from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../redux/hooks';
import { logout } from '../../../redux/slices/authSlice';
import { richNotify } from '../../../utils/notify';
import { SubmitButton } from '../../../components/app-button/AppButton';
import keychainImg from '../../../assests/1cliq-keychain.jpg';
import mugImg from '../../../assests/1cliq-mug.jpg';
import capImg from '../../../assests/1cliq-cap.jpg';
import styles from './AllOrders.module.css';

export type OrderStatus =
    | 'New'
    | 'Confirmed'
    | 'Printing'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled';

export interface CustomerDetail {
    name: string;
    phone: string;
    address: string;
}

export interface OrderItemDetail {
    id: string;
    title: string;
    variant: string;
    quantity: number;
    price: number;
    photos: string[];
}

export interface ShipmentDetail {
    status: OrderStatus;
    courier: string;
    trackingNumber: string;
    notes: string;
}

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

const INITIAL_ORDERS: OrderRecord[] = [
    {
        id: 'ord-1',
        orderNumber: '#9a4c3517',
        customerName: 'Nicy',
        timestamp: '20/9/2026, 9:31:07 pm',
        location: 'Nellore 522002',
        itemCount: 1,
        totalAmount: 99,
        status: 'New',
        customer: {
            name: 'Nicy',
            phone: '9490022488',
            address: 'Police colony, Nellore 522002',
        },
        items: [
            {
                id: 'item-1',
                title: 'Customised Key Chain',
                variant: 'Standard / Clear',
                quantity: 1,
                price: 99,
                photos: [keychainImg, mugImg, capImg],
            },
        ],
        shipment: {
            status: 'New',
            courier: 'Asd',
            trackingNumber: '',
            notes: '',
        },
    },
];

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
    const dispatch = useAppDispatch();
    const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSignOut = () => {
        dispatch(logout());
        richNotify.success('Signed out successfully.');
        navigate('/login');
    };
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>('ord-1');
    const [savedFeedback, setSavedFeedback] = useState<Record<string, boolean>>({
        'ord-1': true,
    });

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
            o.customer.phone.includes(query) ||
            o.location.toLowerCase().includes(query);
        return matchesFilter && matchesSearch;
    });

    const handleToggleExpand = (orderId: string) => {
        setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    };

    const handleUpdateShipmentStatus = (orderId: string, nextStatus: OrderStatus) => {
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

    const handleSaveShipment = (orderId: string) => {
        setSavedFeedback((prev) => ({ ...prev, [orderId]: true }));
        richNotify.success('Shipment details saved successfully.');
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
                    <button
                        type="button"
                        className={styles.signOutBtn}
                        onClick={handleSignOut}
                    >
                        <LogoutOutlined />
                        <span>Sign out</span>
                    </button>
                </div>

                {/* Tabs Navigation (ORDERS / PRODUCTS) */}
                <div className={styles.tabsNav}>
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
                                setSearchQuery('');
                                richNotify.info('Refreshed orders.');
                            }}
                        >
                            <ReloadOutlined />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Orders List with Click-to-Expand Detail View / Empty Filter State */}
                <div>
                    {filteredOrders.length === 0 ? (
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
                                                            const isStatusActive =
                                                                ord.shipment.status.toLowerCase() ===
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

                                                    {/* Save Action CTA Button (AppButton SubmitButton) */}
                                                    <SubmitButton
                                                        onClick={() => handleSaveShipment(ord.id)}
                                                        style={{
                                                            width: '100%',
                                                            height: 44,
                                                            borderRadius: 4,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Save shipment
                                                    </SubmitButton>
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
