import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../features/auth/types/auth.types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: AuthUser, tenantId?: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      tenantId: null,
      isAuthenticated: false,

      setAuth: (token, refreshToken, user, tenantId = null) =>
        set({
          token,
          refreshToken,
          user,
          tenantId: tenantId ?? user.tenantId ?? null,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          tenantId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'tienda-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        tenantId: state.tenantId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);