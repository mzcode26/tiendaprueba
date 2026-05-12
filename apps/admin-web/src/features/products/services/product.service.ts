import { useAuthStore } from '../../../stores/auth.store';
import type {
  ApiResponse,
  CreateProductImageInput,
  CreateProductInput,
  CreateProductVariantInput,
  PaginatedResponse,
  Product,
  ProductFilters,
  UpdateProductInput,
  UpdateProductVariantInput,
} from '../types/product.types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function getAuthHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
  });

  let json: ApiResponse<T> | null = null;

  try {
    json = await res.json();
  } catch {
    // si no hay json, sigue el flujo de error
  }

  if (!res.ok) {
    const message =
      json?.message ||
      (json as any)?.error ||
      'Request failed';

    throw new Error(message);
  }

  if (!json) {
    throw new Error('Empty response from server');
  }

  return json.data;
}

export const productsService = {
  async findAll(filters: ProductFilters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.brandId) params.set('brandId', filters.brandId);
    if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));

    const query = params.toString();
    return request<PaginatedResponse<Product>>(
      `/products${query ? `?${query}` : ''}`,
    );
  },

  async findById(id: string) {
    return request<Product>(`/products/${id}`);
  },

  async create(dto: CreateProductInput) {
    return request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async update(id: string, dto: UpdateProductInput) {
    return request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  async remove(id: string) {
    return request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  async addVariant(productId: string, dto: CreateProductVariantInput) {
    return request<Product>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateProductVariantInput,
  ) {
    return request<Product>(`/products/${productId}/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  async removeVariant(productId: string, variantId: string) {
    return request<{ message: string }>(`/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
    });
  },

  async addImage(productId: string, dto: CreateProductImageInput) {
    return request<Product>(`/products/${productId}/images`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async removeImage(productId: string, imageId: string) {
    return request<{ message: string }>(`/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });
  },
};