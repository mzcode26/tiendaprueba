import api from '../../../lib/axios';

import type {
  TenantSettings,
  Store,
  CreateStoreInput,
  UpdateStoreInput,
  ChangePasswordData,
} from '../types/settings.types';

export const settingsService = {
  getTenantSettings: () =>
    api
      .get<TenantSettings>('/settings/tenant')
      .then((r) => r.data),

  updateTenantSettings: (data: Partial<TenantSettings>) =>
    api
      .patch<TenantSettings>('/settings/tenant', data)
      .then((r) => r.data),

  getStores: async (
    includeInactive = false,
  ): Promise<Store[]> => {
    const params = new URLSearchParams();

    if (includeInactive) {
      params.append('includeInactive', 'true');
    }

    const query = params.toString();

    const url = query
      ? `/stores?${query}`
      : '/stores';

    const response = await api.get(url);

    /**
     * Compatibilidad:
     * - backend devuelve array directo
     * - o { data: [...] }
     */
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    return [];
  },

  getStoreById: async (id: string): Promise<Store> => {
    const { data } = await api.get<Store>(
      `/stores/${id}`,
    );

    return data;
  },

  createStore: (
    data: CreateStoreInput,
  ): Promise<Store> =>
    api
      .post<Store>('/stores', data)
      .then((r) => r.data),

  updateStore: (
    id: string,
    data: UpdateStoreInput,
  ): Promise<Store> =>
    api
      .patch<Store>(`/stores/${id}`, data)
      .then((r) => r.data),

  deleteStore: (id: string): Promise<void> =>
    api
      .delete(`/stores/${id}`)
      .then(() => undefined),

  changePassword: (
    data: ChangePasswordData,
  ) =>
    api
      .post('/auth/change-password', data)
      .then((r) => r.data),
};