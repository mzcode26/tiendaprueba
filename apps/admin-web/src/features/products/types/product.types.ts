export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  categoryId?: string;
  category?: Category;
  brandId?: string;
  brand?: Brand;
  isActive: boolean;
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}