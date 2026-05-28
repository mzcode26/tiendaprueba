import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { authService } from '../services/auth.service';
import type { LoginCredentials } from '../types/auth.types';
import { useAuthStore } from '../../../stores/auth.store';

type LoginVariables = {
  credentials: LoginCredentials;
  tenantId: string;
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: ({ credentials, tenantId }: LoginVariables) =>
      authService.login(credentials, tenantId),

  onSuccess: (response) => {
    const { accessToken, refreshToken, user } = response;
    setAuth(accessToken, refreshToken, user);
    toast.success(`Bienvenido, ${user.firstName}!`);
    navigate('/dashboard');
  },

    onError: () => {
      toast.error('Email o contraseña incorrectos');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();
      navigate('/login');
    },
  });
};