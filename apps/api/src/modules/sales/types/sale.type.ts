import { SaleStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export type SaleWithRelations = {
  id: string;
  tenantId: string;
  storeId: string;
  userId: string;
  customerId: string | null;
  status: SaleStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  store: { id: string; name: string };
  user: { id: string; firstName: string; lastName: string };
  customer: { id: string; firstName: string; lastName: string; phone: string | null } | null;
  items: SaleItemWithRelations[];
  payments: PaymentRecord[];
  _count?: { items: number };
};

export type SaleItemWithRelations = {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
  variant: {
    id: string;
    sku: string;
    product: { id: string; name: string };
  };
};

export type PaymentRecord = {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference: string | null;
  installments: number;
  installmentAmount: number | null;
};

export type SalesSummary = {
  totalSales: number;
  totalRevenue: number;
  totalItems: number;
  byPaymentMethod: {
    method: PaymentMethod;
    count: number;
    total: number;
  }[];
};