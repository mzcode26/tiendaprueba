import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import type { RefreshTokenResponse } from '../features/auth/types/auth.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
const refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (error: Error | null, token: string | null) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue.length = 0;
  if (error) {
    // Errors are handled per-request.
  }
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        window.location.assign('/login');
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        authClient
          .post<{ data: RefreshTokenResponse }>('/auth/refresh', { refreshToken })
          .then((response) => {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            const currentUser = useAuthStore.getState().user;
            useAuthStore.getState().setAuth(accessToken, newRefreshToken, {
              ...(currentUser ?? {
                id: '',
                email: '',
                firstName: '',
                lastName: '',
                name: '',
                tenantId: '',
                roles: [],
              }),
            });
            processQueue(null, accessToken);
            return accessToken;
          })
          .catch((refreshError) => {
            processQueue(refreshError instanceof Error ? refreshError : new Error('Session expired'), null);
            useAuthStore.getState().clearAuth();
            window.location.assign('/login');
            return null;
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      return Promise.reject(new Error((error.response.data as { message: string }).message));
    }

    return Promise.reject(error);
  },
);

export default api;
