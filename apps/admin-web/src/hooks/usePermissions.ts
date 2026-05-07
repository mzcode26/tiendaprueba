import { useAuthStore } from '../stores/auth.store';

export const usePermissions = () => {
  const roles = useAuthStore((state) => state.user?.roles ?? []);

  const hasPermission = (permission: string) => roles.includes(permission);

  return { hasPermission };
};
