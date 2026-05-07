import api from '../../../lib/axios';
import type { TenantSettings, StoreSettings, ChangePasswordData } from '../types/settings.types';
import type { ApiResponse } from '../../../types/api.types';

export const settingsService = {
  getTenantSettings: () =>
    api.get<ApiResponse<TenantSettings>>('/settings/tenant').then(r => r.data),

  updateTenantSettings: (data: Partial<TenantSettings>) =>
    api.patch<ApiResponse<TenantSettings>>('/settings/tenant', data).then(r => r.data),

  getStores: () =>
    api.get<ApiResponse<StoreSettings[]>>('/stores').then(r => r.data),

  createStore: (data: Partial<StoreSettings>) =>
    api.post<ApiResponse<StoreSettings>>('/stores', data).then(r => r.data),

  updateStore: (id: string, data: Partial<StoreSettings>) =>
    api.patch<ApiResponse<StoreSettings>>(`/stores/${id}`, data).then(r => r.data),

  deleteStore: (id: string) =>
    api.delete(`/stores/${id}`).then(r => r.data),

  changePassword: (data: ChangePasswordData) =>
    api.post('/auth/change-password', data).then(r => r.data),
};