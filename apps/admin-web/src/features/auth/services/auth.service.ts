import api from '../../../lib/axios';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';
import type { ApiResponse } from '../../../types/api.types';

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', credentials).then(r => r.data),

  logout: () =>
    api.post('/auth/logout').then(r => r.data),

  me: () =>
    api.get<ApiResponse<LoginResponse['user']>>('/auth/me').then(r => r.data),
};