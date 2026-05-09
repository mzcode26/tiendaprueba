
export type SaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD_DEBIT' | 'CARD_CREDIT' | 'TRANSFER' | 'QR' | 'OTHER';

export interface SaleItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  variant: {
    sku: string;
    size?: string;
    color?: string;
    product: { name: string; imageUrl?: string };
  };
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  status: SaleStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  storeId: string;
  store?: { id: string; name: string };
  customer?: { id: string; firstName: string; lastName: string; email?: string };
  items: SaleItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleFilters {
  search?: string;
  status?: SaleStatus;
  storeId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CartItem {
  variantId: string;
  sku: string;
  productName: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface POSProduct {
  variantId: string;
  sku: string;
  productName: string;
  size?: string;
  color?: string;
  price: number;
  stock: number;
  imageUrl?: string;
}