import api from '../../../lib/axios';
import type { ApiResponse, PaginatedResponse } from '../../../types/api.types';
import type { Product, Category, Brand, ProductFilters, PaginatedProducts } from '../types/product.types';
import type { ProductFormData, CategoryFormData, BrandFormData } from '../schemas/product.schema';

export const productService = {
  // ── Products ──────────────────────────────────────────────
  getProducts: async (filters: ProductFilters = {}): Promise<ApiResponse<PaginatedProducts>> => {
    const params = new URLSearchParams();
    if (filters.search)     params.set('search',     filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.brandId)    params.set('brandId',    filters.brandId);
    if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters.page)       params.set('page',       String(filters.page));
    if (filters.limit)      params.set('limit',      String(filters.limit));

    const { data } = await api.get<ApiResponse<PaginatedProducts>>(`/products?${params}`);
    return data;
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return data;
  },

  createProduct: async (payload: ProductFormData): Promise<ApiResponse<Product>> => {
    const { data } = await api.post<ApiResponse<Product>>('/products', payload);
    return data;
  },

  updateProduct: async (id: string, payload: Partial<ProductFormData>): Promise<ApiResponse<Product>> => {
    const { data } = await api.patch<ApiResponse<Product>>(`/products/${id}`, payload);
    return data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/products/${id}`);
    return data;
  },

  // ── Categories ────────────────────────────────────────────
  getCategories: async (): Promise<ApiResponse<PaginatedResponse<Category>>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Category>>>('/categories?limit=100');
    return data;
  },

  createCategory: async (payload: CategoryFormData): Promise<ApiResponse<Category>> => {
    const { data } = await api.post<ApiResponse<Category>>('/categories', payload);
    return data;
  },

  updateCategory: async (id: string, payload: Partial<CategoryFormData>): Promise<ApiResponse<Category>> => {
    const { data } = await api.patch<ApiResponse<Category>>(`/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/categories/${id}`);
    return data;
  },

  // ── Brands ────────────────────────────────────────────────
  getBrands: async (): Promise<ApiResponse<PaginatedResponse<Brand>>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Brand>>>('/brands?limit=100');
    return data;
  },

  createBrand: async (payload: BrandFormData): Promise<ApiResponse<Brand>> => {
    const { data } = await api.post<ApiResponse<Brand>>('/brands', payload);
    return data;
  },

  updateBrand: async (id: string, payload: Partial<BrandFormData>): Promise<ApiResponse<Brand>> => {
    const { data } = await api.patch<ApiResponse<Brand>>(`/brands/${id}`, payload);
    return data;
  },

  deleteBrand: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/brands/${id}`);
    return data;
  },
};