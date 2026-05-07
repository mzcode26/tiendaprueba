import api from '../../../lib/axios';
import type { DashboardStats, RecentSale, StockAlert } from '../types/dashboard.types';
import type { ApiResponse } from '../../../types/api.types';

export const dashboardService = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/dashboard/stats').then(r => r.data),

  getRecentSales: (limit = 5) =>
    api.get<ApiResponse<RecentSale[]>>('/dashboard/recent-sales', { params: { limit } }).then(r => r.data),

  getStockAlerts: (limit = 5) =>
    api.get<ApiResponse<StockAlert[]>>('/dashboard/stock-alerts', { params: { limit } }).then(r => r.data),
};