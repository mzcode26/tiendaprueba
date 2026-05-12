import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { settingsService } from '../services/settings.service';

import type {
  CreateStoreInput,
  UpdateStoreInput,
} from '../types/settings.types';

const SETTINGS_KEYS = {
  all: ['settings'] as const,

  stores: () =>
    [...SETTINGS_KEYS.all, 'stores'] as const,

  store: (id: string) =>
    [...SETTINGS_KEYS.stores(), id] as const,
};

export function useStores(
  includeInactive = false,
) {
  return useQuery({
    queryKey: [
      ...SETTINGS_KEYS.stores(),
      { includeInactive },
    ],

    queryFn: () =>
      settingsService.getStores(includeInactive),
  });
}

export function useStore(
  id: string,
  enabled = true,
) {
  return useQuery({
    queryKey: SETTINGS_KEYS.store(id),

    queryFn: () =>
      settingsService.getStoreById(id),

    enabled:
      enabled &&
      Boolean(id),
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateStoreInput,
    ) =>
      settingsService.createStore(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.stores(),
      });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStoreInput;
    }) =>
      settingsService.updateStore(
        id,
        payload,
      ),

    onSuccess: async (
      _data,
      variables,
    ) => {
      await queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.stores(),
      });

      await queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.store(
          variables.id,
        ),
      });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      settingsService.deleteStore(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.stores(),
      });
    },
  });
}