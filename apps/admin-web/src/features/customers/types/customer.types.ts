export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  notes?: string;
  isActive: boolean;
  totalSpent: number;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CustomerSale {
  id: string;
  saleNumber: string;
  total: number;
  status: string;
  createdAt: string;
}