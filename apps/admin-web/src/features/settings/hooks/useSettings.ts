import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings.service';

export const useTenantSettings = () =>
  useQuery({
    queryKey: ['settings', 'tenant'],
    queryFn: settingsService.getTenantSettings,
  });

export const useUpdateTenantSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.updateTenantSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings', 'tenant'] }),
  });
};

export const useStores = () =>
  useQuery({
    queryKey: ['stores'],
    queryFn: settingsService.getStores,
  });

export const useCreateStore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.createStore,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  });
};

export const useUpdateStore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof settingsService.updateStore>[1] }) =>
      settingsService.updateStore(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  });
};

export const useDeleteStore = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.deleteStore,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  });
};

export const useChangePassword = () =>
  useMutation({ mutationFn: settingsService.changePassword });