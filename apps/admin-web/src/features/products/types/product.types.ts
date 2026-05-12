export interface CategorySummary {
  id: string;
  name: string;
  slug?: string;
}

export interface BrandSummary {
  id: string;
  name: string;
  slug?: string;
}

export interface AttributeValueRef {
  attributeId: string;
  attributeValueId: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  isActive: boolean;
  attributes?: AttributeValueRef[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  position: number;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  isActive: boolean;
  tags: string[];
  category?: CategorySummary | null;
  brand?: BrandSummary | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductVariantInput {
  sku: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  isActive?: boolean;
  attributes?: AttributeValueRef[];
}

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  tags?: string[];
  variants?: CreateProductVariantInput[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  tags?: string[];
}

export interface UpdateProductVariantInput {
  sku?: string;
  barcode?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  isActive?: boolean;
  attributes?: AttributeValueRef[];
}

export interface CreateProductImageInput {
  url: string;
  altText?: string;
  position?: number;
  isPrimary?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface SelectOption {
  id: string;
  name: string;
}