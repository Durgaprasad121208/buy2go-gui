import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Empty, Button } from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  SkinOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../../services/dashboardService';
import { orderService } from '../../../services/orderService';
import {
  DashboardMetrics,
  RevenueTrendFilterType,
  Buy2GoOrder,
} from '../../../interfaces';
import { richNotify } from '../../../utils/notify';
import styles from './AdminDashboard.module.css';

const STATUS_COLOR_MAP: Record<string, string> = {
  New: '#FF5E00',
  Confirmed: '#1890ff',
  Printing: '#9254de',
  Shipped: '#fa8c16',
  Delivered: '#52c41a',
  Cancelled: '#ff4d4f',
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trendData, setTrendData] = useState<Record<string, any>>({});
  const [trendPeriod, setTrendPeriod] = useState<RevenueTrendFilterType>('MONTH');
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, trendRes] = await Promise.allSettled([
        dashboardService.getMetrics(),
        dashboardService.getRevenueTrend(trendPeriod),
      ]);

      if (metricsRes.status === 'fulfilled') {
        const data = (metricsRes.value as any)?.data || metricsRes.value;
        setMetrics(data);
      } else {
        console.error('Failed to load metrics:', metricsRes.reason);
      }

      if (trendRes.status === 'fulfilled') {
        const trend = (trendRes.value as any)?.data || trendRes.value || {};
        setTrendData(trend);
      } else {
        console.error('Failed to load revenue trend:', trendRes.reason);
      }
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      richNotify.error('Could not load dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePeriodChange = async (period: RevenueTrendFilterType) => {
    setTrendPeriod(period);
    try {
      const res = await dashboardService.getRevenueTrend(period);
      const trend = (res as any)?.data || res || {};
      setTrendData(trend);
    } catch (err) {
      console.error('Period change error:', err);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      richNotify.info('Generating orders Excel report...');
      await orderService.downloadOrdersExcel();
      richNotify.success('Orders Excel report downloaded successfully.');
    } catch (err: any) {
      console.error('Download error:', err);
      const msg = err?.data?.message || err?.message || 'Download failed';
      richNotify.error(`Export failed: ${msg}`);
    } finally {
      setExporting(false);
    }
  };

  // Compute status counts & total orders for progress calculation
  const statusCounts = metrics?.statusCounts || {};
  const totalOrdersCount = metrics?.totalOrders || Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  // Format trend bars
  const trendEntries = Object.entries(trendData || {});
  const maxTrendVal = Math.max(1, ...trendEntries.map(([, val]) => Number(val) || 0));

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.contentWrapper}>
        {/* Header Section */}
        <div className={styles.headerTop}>
          <div>
            <span className={styles.ownerTag}>OWNER DASHBOARD</span>
            <h1 className={styles.pageTitle}>BUSINESS ANALYTICS & OVERVIEW</h1>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => {
                fetchDashboardData();
                richNotify.info('Refreshed dashboard data.');
              }}
            >
              <ReloadOutlined />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleExportExcel}
              disabled={exporting}
            >
              <DownloadOutlined />
              <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (DASHBOARD / ORDERS / PRODUCTS) */}
        <div className={styles.tabsNav}>
          <button
            type="button"
            className={`${styles.tabItem} ${styles.tabItemActive}`}
          >
            DASHBOARD
          </button>
          <button
            type="button"
            className={styles.tabItem}
            onClick={() => navigate('/admin/orders')}
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* KPI Metrics Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <div className={styles.kpiCard}>
                  <div>
                    <div className={styles.kpiHeader}>
                      <span className={styles.kpiLabel}>TOTAL REVENUE</span>
                      <div className={styles.kpiIconWrapper}>
                        <RiseOutlined />
                      </div>
                    </div>
                    <div className={styles.kpiValue}>
                      ₹{Number(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className={styles.kpiSubtext}>From fulfilled customer orders</div>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div className={styles.kpiCard}>
                  <div>
                    <div className={styles.kpiHeader}>
                      <span className={styles.kpiLabel}>TOTAL ORDERS</span>
                      <div className={styles.kpiIconWrapper}>
                        <ShoppingCartOutlined />
                      </div>
                    </div>
                    <div className={styles.kpiValue}>
                      {Number(metrics?.totalOrders || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className={styles.kpiSubtext}>All-time checkout orders</div>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div className={styles.kpiCard}>
                  <div>
                    <div className={styles.kpiHeader}>
                      <span className={styles.kpiLabel}>CATALOG PRODUCTS</span>
                      <div className={styles.kpiIconWrapper}>
                        <SkinOutlined />
                      </div>
                    </div>
                    <div className={styles.kpiValue}>
                      {Number(metrics?.totalProducts || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className={styles.kpiSubtext}>Available in inventory</div>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div className={styles.kpiCard}>
                  <div>
                    <div className={styles.kpiHeader}>
                      <span className={styles.kpiLabel}>LIVE PRODUCTS</span>
                      <div className={styles.kpiIconWrapper}>
                        <CheckCircleOutlined />
                      </div>
                    </div>
                    <div className={styles.kpiValue}>
                      {Number(metrics?.liveProducts || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className={styles.kpiSubtext}>Visible to public shoppers</div>
                </div>
              </Col>
            </Row>

            {/* Revenue Trend Chart & Status Breakdown */}
            <Row gutter={[20, 20]}>
              <Col xs={24} lg={15}>
                <div className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <RiseOutlined className={styles.sectionTitleIcon} />
                      Revenue Trend
                    </h2>
                    <div className={styles.periodFilterGroup}>
                      {(['DAY', 'WEEK', 'MONTH', 'YEAR'] as RevenueTrendFilterType[]).map((period) => (
                        <button
                          key={period}
                          type="button"
                          className={`${styles.periodBtn} ${
                            trendPeriod === period ? styles.periodBtnActive : ''
                          }`}
                          onClick={() => handlePeriodChange(period)}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {trendEntries.length === 0 ? (
                    <Empty
                      description={<span style={{ color: '#8C867E' }}>No revenue recorded for this period.</span>}
                      style={{ padding: '30px 0' }}
                    />
                  ) : (
                    <div className={styles.trendChartContainer}>
                      {trendEntries.map(([key, rawVal]) => {
                        const val = Number(rawVal) || 0;
                        const heightPct = Math.max(12, Math.round((val / maxTrendVal) * 100));
                        return (
                          <div key={key} className={styles.trendBarCol}>
                            <div className={styles.trendBarVal}>₹{val}</div>
                            <div
                              className={styles.trendBar}
                              style={{ height: `${heightPct}%` }}
                              title={`${key}: ₹${val}`}
                            />
                            <div className={styles.trendBarLabel}>{key}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Col>

              <Col xs={24} lg={9}>
                <div className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Order Statuses</h2>
                  </div>

                  <div className={styles.statusBreakdownGrid}>
                    {['New', 'Confirmed', 'Printing', 'Shipped', 'Delivered', 'Cancelled'].map((statusKey) => {
                      const count = statusCounts[statusKey] || 0;
                      const percentage = Math.round((count / totalOrdersCount) * 100);
                      const color = STATUS_COLOR_MAP[statusKey] || '#FF5E00';

                      return (
                        <div key={statusKey} className={styles.statusRow}>
                          <div className={styles.statusRowTop}>
                            <span className={styles.statusName}>
                              <span
                                className={styles.statusDot}
                                style={{ backgroundColor: color }}
                              />
                              {statusKey}
                            </span>
                            <span className={styles.statusCount}>
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className={styles.progressBarBg}>
                            <div
                              className={styles.progressBarFill}
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Col>
            </Row>

            {/* Recent Orders Preview */}
            <div className={styles.sectionCard} style={{ marginTop: 20 }}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <ShoppingCartOutlined className={styles.sectionTitleIcon} />
                  Recent Orders
                </h2>
                <Button
                  type="link"
                  onClick={() => navigate('/admin/orders')}
                  style={{ color: '#FF5E00', padding: 0, fontWeight: 700 }}
                  icon={<ArrowRightOutlined />}
                >
                  View All Orders
                </Button>
              </div>

              {(!metrics?.recentOrders || metrics.recentOrders.length === 0) ? (
                <Empty
                  description={<span style={{ color: '#8C867E' }}>No recent orders found.</span>}
                  style={{ padding: '30px 0' }}
                />
              ) : (
                <div className={styles.recentTableWrapper}>
                  <table className={styles.recentTable}>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Location</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentOrders.slice(0, 8).map((ord: any) => {
                        const statusClass = styles[`status${ord.status}`] || styles.statusNew;
                        const orderNum = ord.orderNumber || `#${String(ord.id).slice(-8)}`;
                        const custName = ord.customerName || ord.customer?.name || 'Customer';

                        return (
                          <tr key={ord.id}>
                            <td>
                              <span
                                className={styles.orderNumLink}
                                onClick={() => navigate('/admin/orders')}
                              >
                                {orderNum}
                              </span>
                            </td>
                            <td>{custName}</td>
                            <td>{ord.location || ord.customer?.address || 'India'}</td>
                            <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                              ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                            </td>
                            <td>
                              <span className={`${styles.statusBadge} ${statusClass}`}>
                                {ord.status}
                              </span>
                            </td>
                            <td>
                              <Button
                                size="small"
                                type="text"
                                onClick={() => navigate('/admin/orders')}
                                style={{ color: '#FF5E00', fontWeight: 600 }}
                              >
                                Manage
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
