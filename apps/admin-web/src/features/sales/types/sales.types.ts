export type SaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export type SalePaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'| 'CARD_DEBIT' | 'CARD_CREDIT' | 'QR' ;

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface SaleCustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
}

export interface SaleStoreSummary {
  id: string;
  name: string;
}

export interface SaleUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
}

export interface SaleVariantRelation {
  id?: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  product: {
    id?: string;
    name: string;
    images?: { url: string }[];
  };
  attributes?: unknown[];
}

export interface SaleItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountAmount?: number;
  subtotal: number;
  variant: SaleVariantRelation;
}

export interface Payment {
  id: string;
  method: SalePaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference?: string | null;
  installments?: number;
  installmentAmount?: number | null;
  createdAt?: string;
}

export interface SaleBase {
  id: string;
  saleNumber: string;
  status: SaleStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  notes?: string | null;
  storeId: string;
  store?: SaleStoreSummary;
  customer?: SaleCustomerSummary | null;
  user?: SaleUserSummary | null;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleListItem extends SaleBase {
  _count?: {
    items: number;
  };
}

export interface SaleDetail extends SaleBase {
  cancelledAt?: string | null;
  cancelReason?: string | null;
  items: SaleItem[];
}

export interface SaleListResponse {
  items: SaleListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SaleFilters {
  search?: string;
  status?: SaleStatus;
  storeId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CreateSaleItemPayload {
  variantId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CreateSalePaymentPayload {
  method: SalePaymentMethod;
  amount: number;
  reference?: string;
}

export interface CreateSalePayload {
  storeId: string;
  customerId?: string;
  items: CreateSaleItemPayload[];
  payments?: CreateSalePaymentPayload[];
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
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