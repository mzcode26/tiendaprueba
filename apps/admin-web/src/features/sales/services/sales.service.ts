import api from '../../../lib/axios';
import type {
  CreateSalePayload,
  POSProduct,
  SaleDetail,
  SaleFilters,
  SaleListResponse,
} from '../types/sales.types';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  timestamp?: string;
};

const sanitizePayload = <T extends object>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  ) as Partial<T>;
};

const unwrapArrayLike = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const maybe = value as { items?: T[]; data?: T[] };
    if (Array.isArray(maybe.items)) return maybe.items;
    if (Array.isArray(maybe.data)) return maybe.data;
  }
  return [];
};

export const salesService = {
  getSales: async (filters?: SaleFilters): Promise<SaleListResponse> => {
    const response = await api.get<ApiEnvelope<SaleListResponse>>('/sales', { params: filters });
    return response.data.data;
  },

  getSaleById: async (id: string): Promise<SaleDetail> => {
    const response = await api.get<ApiEnvelope<SaleDetail>>(`/sales/${id}`);
    return response.data.data;
  },

  createSale: async (data: CreateSalePayload): Promise<SaleDetail> => {
    const response = await api.post<ApiEnvelope<SaleDetail>>('/sales', sanitizePayload(data));
    return response.data.data;
  },

  cancelSale: async (id: string, reason: string): Promise<{ message?: string }> => {
    const response = await api.post<ApiEnvelope<{ message?: string }>>(`/sales/${id}/cancel`, { reason });
    return response.data.data;
  },

  searchPOSProducts: async (query: string, storeId: string): Promise<POSProduct[]> => {
    const response = await api.get<ApiEnvelope<POSProduct[]>>('/pos/search', {
      params: { q: query, storeId },
    });

    return unwrapArrayLike<POSProduct>(response.data.data);
  },
};