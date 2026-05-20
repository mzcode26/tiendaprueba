import api from '../../../lib/axios';
import type {
  CustomerDetail,
  CustomerFilters,
  CustomerListResponse,
  CustomerStats,
  CustomerUpsertPayload,
} from '../types/customer.types';

type ApiWrapper<T> = {
  success: boolean;
  data: T;
  timestamp?: string;
};

const sanitizePayload = (data: Partial<CustomerUpsertPayload>) => {
  const entries = Object.entries(data).filter(([, value]) => value !== '' && value !== undefined && value !== null);
  return Object.fromEntries(entries) as Record<string, unknown>;
};

const sanitizeCreatePayload = (data: Partial<CustomerUpsertPayload>) => {
  const { isActive, ...rest } = data;
  return sanitizePayload(rest);
};

export const customersService = {
  getCustomers: async (filters?: CustomerFilters): Promise<CustomerListResponse> => {
    const response = await api.get<ApiWrapper<CustomerListResponse>>('/customers', { params: filters });
    return response.data.data;
  },

  getCustomerById: async (id: string): Promise<CustomerDetail> => {
    const response = await api.get<ApiWrapper<CustomerDetail>>(`/customers/${id}`);
    return response.data.data;
  },

  getCustomerStats: async (id: string): Promise<CustomerStats> => {
    const response = await api.get<ApiWrapper<CustomerStats>>(`/customers/${id}/stats`);
    return response.data.data;
  },

  createCustomer: async (data: CustomerUpsertPayload): Promise<CustomerDetail> => {
    const response = await api.post<ApiWrapper<CustomerDetail>>('/customers', sanitizeCreatePayload(data));
    return response.data.data;
  },

  updateCustomer: async (id: string, data: Partial<CustomerUpsertPayload>): Promise<CustomerDetail> => {
    const response = await api.patch<ApiWrapper<CustomerDetail>>(`/customers/${id}`, sanitizePayload(data));
    return response.data.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};