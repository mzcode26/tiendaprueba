import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { inventoryService } from '../services/inventory.service';

import type {
  AdjustStockInput,
  InventoryMovementType,
  InventoryItem,
  InventoryMovement,
  LowStockAlert,
  PaginatedResponse,
  TransferStockInput,
  UpdateInventorySettingsInput,
} from '../types/inventory.types';

const INVENTORY_KEYS = {
  all: ['inventory'] as const,
  lists: () => [...INVENTORY_KEYS.all, 'lists'] as const,
  storeList: (storeId: string) =>
    [...INVENTORY_KEYS.lists(), 'store', storeId] as const,
  item: (storeId: string, variantId: string) =>
    [...INVENTORY_KEYS.all, 'item', storeId, variantId] as const,
  lowStock: () => [...INVENTORY_KEYS.all, 'low-stock'] as const,
  movements: () => [...INVENTORY_KEYS.all, 'movements'] as const,
  movementList: (
    filters?: {
      storeId?: string;
      variantId?: string;
      type?: InventoryMovementType;
      page?: number;
      limit?: number;
    },
  ) => [...INVENTORY_KEYS.movements(), filters ?? {}] as const,
};

export function useInventoryByStore(
  storeId: string,
  enabled = true,
) {
  return useQuery<InventoryItem[]>({
    queryKey: INVENTORY_KEYS.storeList(storeId),
    queryFn: () => inventoryService.getByStore(storeId),
    enabled: enabled && Boolean(storeId),
  });
}

export function useInventoryItem(
  storeId: string,
  variantId: string,
  enabled = true,
) {
  return useQuery<InventoryItem>({
    queryKey: INVENTORY_KEYS.item(storeId, variantId),
    queryFn: () =>
      inventoryService.getByVariantAndStore(storeId, variantId),
    enabled:
      enabled &&
      Boolean(storeId) &&
      Boolean(variantId),
  });
}

export function useLowStock(enabled = true) {
  return useQuery<LowStockAlert[]>({
    queryKey: INVENTORY_KEYS.lowStock(),
    queryFn: () => inventoryService.getLowStock(),
    enabled,
  });
}

export function useInventoryMovements(
  filters?: {
    storeId?: string;
    variantId?: string;
    type?: InventoryMovementType;
    page?: number;
    limit?: number;
  },
  enabled = true,
) {
  return useQuery<PaginatedResponse<InventoryMovement>>({
    queryKey: INVENTORY_KEYS.movementList(filters),
    queryFn: () => inventoryService.getMovements(filters),
    enabled,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdjustStockInput) =>
      inventoryService.adjustStock(payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.storeList(variables.storeId),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.item(
          variables.storeId,
          variables.variantId,
        ),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.lowStock(),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.movements(),
      });
    },
  });
}

export function useTransferStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransferStockInput) =>
      inventoryService.transferStock(payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.storeList(variables.fromStoreId),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.storeList(variables.toStoreId),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.item(
          variables.fromStoreId,
          variables.variantId,
        ),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.item(
          variables.toStoreId,
          variables.variantId,
        ),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.lowStock(),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.movements(),
      });
    },
  });
}

export function useUpdateInventorySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInventorySettingsInput) =>
      inventoryService.updateInventorySettings(payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.storeList(variables.storeId),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.item(
          variables.storeId,
          variables.variantId,
        ),
      });

      await queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.lowStock(),
      });
    },
  });
}