import api from '../../../lib/axios';
import type { SalesSummary, SalesByDay, TopProduct, TopCustomer, ReportFilters } from '../types/reports.types';
import type { ApiResponse } from '../../../types/api.types';

export const reportsService = {
  getSalesSummary: (filters?: ReportFilters) =>
    api.get<ApiResponse<SalesSummary>>('/reports/sales/summary', { params: filters }).then(r => r.data),

  getSalesByDay: (filters?: ReportFilters) =>
    api.get<ApiResponse<SalesByDay[]>>('/reports/sales/by-day', { params: filters }).then(r => r.data),

  getTopProducts: (filters?: ReportFilters) =>
    api.get<ApiResponse<TopProduct[]>>('/reports/products/top', { params: filters }).then(r => r.data),

  getTopCustomers: (filters?: ReportFilters) =>
    api.get<ApiResponse<TopCustomer[]>>('/reports/customers/top', { params: filters }).then(r => r.data),
};