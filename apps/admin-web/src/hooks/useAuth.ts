import { useNavigate } from 'react-router-dom';
import { authService } from '../features/auth/services/auth.service';
import { useAuthStore, AuthUser } from '../stores/auth.store';

interface LoginPayload {
  email: string;
  password: string;
}

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = async (credentials: LoginPayload) => {
    try {
      const response = await authService.login(credentials);
      const userData: AuthUser = {
        ...response.user,
        name: `${response.user.firstName} ${response.user.lastName}`,
      };
      setAuth(response.accessToken, response.refreshToken, userData);
      navigate('/dashboard');
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return Promise.reject(error.message);
      }
      return Promise.reject('Login failed');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return { user, isAuthenticated, login, logout };
};
