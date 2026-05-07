import { create } from 'zustand';
import type { AuthUser } from '../features/auth/types/auth.types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: AuthUser) => void;
  clearAuth: () => void;
}

const STORAGE_KEY = 'tienda-auth';

const loadFromStorage = (): Partial<AuthState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveToStorage = (state: Partial<AuthState>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

const stored = loadFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  token: stored.token ?? null,
  refreshToken: stored.refreshToken ?? null,
  user: stored.user ?? null,
  isAuthenticated: stored.isAuthenticated ?? false,

  setAuth: (token, refreshToken, user) => {
    const next = { token, refreshToken, user, isAuthenticated: true };
    saveToStorage(next);
    set(next);
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
}));