export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  averageTicket: number;
  period: string;
}

export interface SalesByDay {
  date: string;
  sales: number;
  revenue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  salesCount: number;
  totalSpent: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  storeId?: string;
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}