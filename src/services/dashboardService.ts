import { GetAPIRequest } from "../api/api";
import {
  DASHBOARD_METRICS_ENDPOINT,
  DASHBOARD_REVENUE_TREND_ENDPOINT,
} from "../constants/constants";
import {
  ApiResponse,
  DashboardMetrics,
  RevenueTrendFilterType,
} from "../interfaces";

export const dashboardService = {
  /**
   * Get overall business metrics (orders, products, revenue, status breakdown)
   * GET /api/dashboard/metrics
   */
  getMetrics: async (): Promise<ApiResponse<DashboardMetrics>> => {
    return GetAPIRequest({
      url: DASHBOARD_METRICS_ENDPOINT,
    });
  },

  /**
   * Get revenue analytics by filter period (DAY, WEEK, MONTH, YEAR)
   * GET /api/dashboard/revenue-trend/{filterType}
   */
  getRevenueTrend: async (
    filterType: RevenueTrendFilterType = "MONTH"
  ): Promise<ApiResponse<Record<string, any>>> => {
    return GetAPIRequest({
      url: DASHBOARD_REVENUE_TREND_ENDPOINT(filterType),
    });
  },
};

export default dashboardService;
