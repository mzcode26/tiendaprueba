import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings.service';
import type { TenantSettings, Store, ChangePasswordData} from '../types/settings.types';
import type {  } from '../types/settings.types';

export const settingsKeys = {
  all: ['settings'] as const,
  tenant: () => [...settingsKeys.all, 'tenant'] as const,
  stores: () => [...settingsKeys.all, 'stores'] as const,
};

export function useTenantSettings() {
  return useQuery<TenantSettings>({
    queryKey: settingsKeys.tenant(),
    queryFn: () => settingsService.getTenantSettings(),
  });
}

export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TenantSettings>) =>
      settingsService.updateTenantSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsKeys.tenant(), updatedSettings);
      queryClient.invalidateQueries({ queryKey: settingsKeys.tenant() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => settingsService.changePassword(data),
  });
}

export function useStores() {
  return useQuery<Store[]>({
    queryKey: settingsKeys.stores(),
    queryFn: () => settingsService.getStores(),
  });
}

/**
 * Si necesitas un store puntual, lo resolvemos desde la lista ya cargada.
 * Así evitamos depender de un método getStore que no existe en el service.
 */
export function useStore(id: string) {
  const query = useStores();

  return {
    ...query,
    data: query.data?.find((store) => store.id === id),
  };
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.stores() });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: any;
    }) => settingsService.updateStore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.stores() });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.deleteStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.stores() });
    },
  });
}