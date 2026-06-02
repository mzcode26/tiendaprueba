import api from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api.types';
import type {
  DashboardSummary,
  ReportFilters,
  SalesOverTime,
  TopCustomer,
  TopProduct,
} from '../types/reports.types';

type RawDashboardSummary = DashboardSummary;
type RawSalesOverTime = Array<{
  period: string;
  total_sales: string | number;
  total_revenue: string | number;
}>;
type RawTopProduct = Array<{
  product_id: string;
  product_name: string;
  variant_sku: string;
  total_quantity: string | number;
  total_revenue: string | number;
}>;
type RawTopCustomer = Array<{
  customer_id: string;
  full_name: string;
  email: string;
  total_orders: string | number;
  total_spent: string | number;
}>;

const toNumber = (value: unknown) => Number(value ?? 0);

const getDateRange = (period: NonNullable<ReportFilters['period']>, filters?: ReportFilters) => {
  const now = new Date();

  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

  const endOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

  const subtractDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;
  let groupBy: 'DAY' | 'WEEK' | 'MONTH' = 'DAY';

  switch (period) {
    case 'today':
      dateFrom = startOfDay(now);
      dateTo = endOfDay(now);
      groupBy = 'DAY';
      break;
    case 'week':
      dateFrom = startOfDay(subtractDays(now, 6));
      dateTo = endOfDay(now);
      groupBy = 'DAY';
      break;
    case 'month':
      dateFrom = startOfDay(subtractDays(now, 29));
      dateTo = endOfDay(now);
      groupBy = 'DAY';
      break;
    case 'quarter':
      dateFrom = startOfDay(subtractDays(now, 89));
      dateTo = endOfDay(now);
      groupBy = 'WEEK';
      break;
    case 'year':
      dateFrom = startOfDay(subtractDays(now, 364));
      dateTo = endOfDay(now);
      groupBy = 'MONTH';
      break;
    case 'custom':
      if (filters?.startDate) dateFrom = startOfDay(new Date(filters.startDate));
      if (filters?.endDate) dateTo = endOfDay(new Date(filters.endDate));
      groupBy = 'DAY';
      break;
  }

  return {
    dateFrom: dateFrom?.toISOString(),
    dateTo: dateTo?.toISOString(),
    groupBy,
  };
};

const buildCommonParams = (filters?: ReportFilters) => {
  const period = filters?.period ?? 'month';
  const { dateFrom, dateTo, groupBy } = getDateRange(period, filters);

  return {
    ...(filters?.storeId ? { storeId: filters.storeId } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    groupBy,
  };
};

export const reportsService = {
  getDashboardSummary: (filters?: ReportFilters) =>
    api.get<ApiResponse<RawDashboardSummary>>('/reports/dashboard', {
      params: filters?.storeId ? { storeId: filters.storeId } : undefined,
    }).then((r) => r.data),

  getSalesByDay: (filters?: ReportFilters) =>
    api.get<ApiResponse<RawSalesOverTime>>('/reports/sales-over-time', {
      params: buildCommonParams(filters),
    }).then((r) => ({
      ...r.data,
      data: r.data.data.map<SalesOverTime>((row) => ({
        period: row.period,
        totalSales: toNumber(row.total_sales),
        totalRevenue: toNumber(row.total_revenue),
      })),
    })),

  getTopProducts: (filters?: ReportFilters) =>
    api.get<ApiResponse<RawTopProduct>>('/reports/top-products', {
      params: buildCommonParams(filters),
    }).then((r) => ({
      ...r.data,
      data: r.data.data.map<TopProduct>((row) => ({
        productId: row.product_id,
        productName: row.product_name,
        variantSku: row.variant_sku,
        totalQuantity: toNumber(row.total_quantity),
        totalRevenue: toNumber(row.total_revenue),
      })),
    })),

  getTopCustomers: (filters?: ReportFilters) =>
    api.get<ApiResponse<RawTopCustomer>>('/reports/top-customers', {
      params: buildCommonParams(filters),
    }).then((r) => ({
      ...r.data,
      data: r.data.data.map<TopCustomer>((row) => ({
        customerId: row.customer_id,
        fullName: row.full_name,
        email: row.email,
        totalOrders: toNumber(row.total_orders),
        totalSpent: toNumber(row.total_spent),
      })),
    })),
};
