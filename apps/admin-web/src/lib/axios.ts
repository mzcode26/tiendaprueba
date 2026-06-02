import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import type { RefreshTokenResponse, AuthUser } from '../features/auth/types/auth.types';

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

const processQueue = (_error: Error | null, token: string | null) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue.length = 0;
};

api.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();

  if (config.headers) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.tenantId) {
      config.headers['x-tenant-id'] = user.tenantId;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest.url === '/auth/refresh' ||
      originalRequest.url === '/auth/login';

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
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
          .post<{ success: boolean; data: RefreshTokenResponse }>(
            '/auth/refresh',
            { refreshToken },
          )
          .then((response) => {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            const currentUser = useAuthStore.getState().user;

            const safeUser: AuthUser = currentUser ?? {
              id: '',
              email: '',
              firstName: '',
              lastName: '',
              tenantId: '',
              roles: [],
              permissions: [],
            };

            useAuthStore
              .getState()
              .setAuth(accessToken, newRefreshToken, safeUser);

            processQueue(null, accessToken);
          })
          .catch((refreshError) => {
            processQueue(
              refreshError instanceof Error
                ? refreshError
                : new Error('Session expired'),
              null,
            );
            useAuthStore.getState().clearAuth();
            window.location.assign('/login');
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

    if (
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data
    ) {
      return Promise.reject(
        new Error((error.response.data as { message: string }).message),
      );
    }

    return Promise.reject(error);
  },
);

export default api;