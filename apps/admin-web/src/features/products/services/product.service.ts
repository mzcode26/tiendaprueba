import api from '../../../lib/axios';
import type { Product, ProductFilters, PaginatedProducts, Category, Brand } from '../types/product.types';
import type { ApiResponse } from '../../../types/api.types';

export const productService = {
  getProducts: (filters?: ProductFilters) =>
    api.get<ApiResponse<PaginatedProducts>>('/products', { params: filters }).then(r => r.data),

  getProduct: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`).then(r => r.data),

  createProduct: (data: Partial<Product>) =>
    api.post<ApiResponse<Product>>('/products', data).then(r => r.data),

  updateProduct: (id: string, data: Partial<Product>) =>
    api.patch<ApiResponse<Product>>(`/products/${id}`, data).then(r => r.data),

  deleteProduct: (id: string) =>
    api.delete(`/products/${id}`).then(r => r.data),

  // Variants
  createVariant: (productId: string, data: Partial<ProductVariant>) =>
    api.post<ApiResponse<ProductVariant>>(`/products/${productId}/variants`, data).then(r => r.data),

  updateVariant: (productId: string, variantId: string, data: Partial<ProductVariant>) =>
    api.patch<ApiResponse<ProductVariant>>(`/products/${productId}/variants/${variantId}`, data).then(r => r.data),

  deleteVariant: (productId: string, variantId: string) =>
    api.delete(`/products/${productId}/variants/${variantId}`).then(r => r.data),

  // Categories
  getCategories: () =>
    api.get<ApiResponse<Category[]>>('/categories').then(r => r.data),

  createCategory: (data: Partial<Category>) =>
    api.post<ApiResponse<Category>>('/categories', data).then(r => r.data),

  // Brands
  getBrands: () =>
    api.get<ApiResponse<Brand[]>>('/brands').then(r => r.data),

  createBrand: (data: Partial<Brand>) =>
    api.post<ApiResponse<Brand>>('/brands', data).then(r => r.data),
};