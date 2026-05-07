import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiResponse } from '@tienda/shared-types';

export interface ApiClientOptions {
  getToken?: () => string | null;
}

export function createApiClient(baseURL: string, options?: ApiClientOptions): AxiosInstance {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use((config) => {
    const token = options?.getToken?.();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => {
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        return response.data as ApiResponse<unknown>;
      }
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        return Promise.reject(error.response.data ?? error.message);
      }
      return Promise.reject(error.message);
    },
  );

  return api;
}
