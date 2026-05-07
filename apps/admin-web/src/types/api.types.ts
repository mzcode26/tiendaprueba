export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  totalItems: number;
  byPaymentMethod: Record<string, { count: number; total: number }>;
}

export interface InventorySummary {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalSpent: number;
    salesCount: number;
  }>;
}
