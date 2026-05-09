import { api } from '../../../lib/axios';
import type { Sale, SaleFilters } from '../types/sales.types';
import type { ApiResponse, PaginatedResponse } from '../../../types/api.types';

export const salesService = {
  getSales: (filters?: SaleFilters) =>
    api.get<PaginatedResponse<Sale>>('/sales', { params: filters }).then(r => r.data),

  getSaleById: (id: string) =>
    api.get<ApiResponse<Sale>>(`/sales/${id}`).then(r => r.data),

  createSale: (data: unknown) =>
    api.post<ApiResponse<Sale>>('/sales', data).then(r => r.data),

  cancelSale: (id: string, reason: string) =>
    api.patch<ApiResponse<Sale>>(`/sales/${id}/cancel`, { reason }).then(r => r.data),

  addPayment: (saleId: string, data: unknown) =>
    api.post(`/sales/${saleId}/payments`, data).then(r => r.data),

  searchPOSProducts: (query: string, storeId: string) =>
    api.get('/pos/search', { params: { q: query, storeId } }).then(r => r.data),

  createQuickSale: (data: unknown) =>
    api.post('/pos/quick-sale', data).then(r => r.data),
};