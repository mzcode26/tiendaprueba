export type CustomerGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface CustomerSale {
  id: string;
  saleNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface CustomerListItem {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    sales: number;
  };
}

export interface CustomerDetail extends CustomerListItem {
  address?: string | null;
  province?: string | null;
  postalCode?: string | null;
  taxId?: string | null;
  birthDate?: string | null;
  gender?: CustomerGender | null;
  notes?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  sales?: CustomerSale[];
}

export interface CustomerStats {
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseAt: string | null;
}

export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CustomerListResponse {
  items: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerFormDefaults {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  taxId?: string | null;
  birthDate?: string | null;
  gender?: CustomerGender | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface CustomerUpsertPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  taxId?: string;
  birthDate?: string;
  gender?: CustomerGender;
  notes?: string;
  isActive?: boolean;
}