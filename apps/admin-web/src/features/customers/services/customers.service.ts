import api from '../../../lib/axios';
import type { Customer, CustomerFilters } from '../types/customer.types';
import type { ApiResponse, PaginatedResponse } from '../../../types/api.types';

export const customersService = {
  getCustomers: (filters?: CustomerFilters) =>
    api.get<PaginatedResponse<Customer>>('/customers', { params: filters }).then(r => r.data),

  getCustomerById: (id: string) =>
    api.get<ApiResponse<Customer>>(`/customers/${id}`).then(r => r.data),

  createCustomer: (data: Partial<Customer>) =>
    api.post<ApiResponse<Customer>>('/customers', data).then(r => r.data),

  updateCustomer: (id: string, data: Partial<Customer>) =>
    api.patch<ApiResponse<Customer>>(`/customers/${id}`, data).then(r => r.data),

  deleteCustomer: (id: string) =>
    api.delete(`/customers/${id}`).then(r => r.data),

  getCustomerSales: (id: string) =>
    api.get<ApiResponse<CustomerSale[]>>(`/customers/${id}/sales`).then(r => r.data),
};