export interface DashboardStats {
  todaySales: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface RecentSale {
  id: string;
  saleNumber: string;
  customerName?: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  storeName: string;
}