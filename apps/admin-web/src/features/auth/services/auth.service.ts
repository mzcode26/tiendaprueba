import api from '../../../lib/axios';
import type {
  LoginCredentials,
  LoginResponse,
  AuthUser,
} from '../types/auth.types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  timestamp?: string;
};

export const authService = {
  login: async (credentials: LoginCredentials, tenantId: string) => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials,
      {
        headers: {
          'x-tenant-id': tenantId,
        },
      },
    );

    return response.data.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/refresh',
      {
        refreshToken,
      },
    );

    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<AuthUser>>('/auth/profile');
    return response.data.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};