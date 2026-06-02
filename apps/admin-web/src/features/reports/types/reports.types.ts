export type ReportPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface ReportFilters {
  storeId?: string;
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
}

export interface DashboardSummary {
  today: {
    sales: number;
    revenue: number;
  };
  currentMonth: {
    sales: number;
    revenue: number;
    revenueGrowth: number;
  };
  lastMonth: {
    sales: number;
    revenue: number;
  };
  totalCustomers: number;
  lowStockAlerts: number;
}

export interface SalesOverTime {
  period: string;
  totalSales: number;
  totalRevenue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  variantSku: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface TopCustomer {
  customerId: string;
  fullName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}
