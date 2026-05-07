export type SalesSummary = {
  totalSales: number;
  totalRevenue: number;
  totalItems: number;
  byPaymentMethod: Record<string, { count: number; total: number }>;
};

export type InventorySummary = {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
};

export type CustomerSummary = {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  topCustomers: {
    id: string;
    name: string;
    totalSpent: number;
    salesCount: number;
  }[];
};