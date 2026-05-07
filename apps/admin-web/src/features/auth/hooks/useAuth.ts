import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../../../stores/auth.store';
import { toast } from 'sonner';

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response.data;
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