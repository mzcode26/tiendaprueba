import api from '../../../lib/axios';

import type {
  AdjustStockInput,
  InventoryItem,
  InventoryMovement,
  InventoryMovementType,
  LowStockAlert,
  PaginatedResponse,
  TransferResult,
  TransferStockInput,
  UpdateInventorySettingsInput,
} from '../types/inventory.types';

function buildQuery(
  params: Record<string, string | number | boolean | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as {
      items?: unknown;
      data?: unknown;
      results?: unknown;
    };

    if (Array.isArray(obj.items)) {
      return obj.items as T[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data as T[];
    }

    if (Array.isArray(obj.results)) {
      return obj.results as T[];
    }
  }

  return [];
}

function toItem<T>(payload: unknown): T {
  if (payload && typeof payload === 'object') {
    const obj = payload as {
      item?: unknown;
      data?: unknown;
      result?: unknown;
    };

    if (obj.item && !Array.isArray(obj.item)) {
      return obj.item as T;
    }

    if (obj.data && !Array.isArray(obj.data)) {
      return obj.data as T;
    }

    if (obj.result && !Array.isArray(obj.result)) {
      return obj.result as T;
    }
  }

  return payload as T;
}

function toPaginatedResponse<T>(
  payload: unknown,
): PaginatedResponse<T> {
  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload)
  ) {
    const obj = payload as Partial<PaginatedResponse<T>> & {
      items?: unknown;
      data?: unknown;
      results?: unknown;
    };

    const items =
      toArray<T>(obj.items) ||
      toArray<T>(obj.data) ||
      toArray<T>(obj.results);

    if (items.length > 0 || typeof obj.total === 'number') {
      return {
        items,
        total: obj.total ?? items.length,
        page: obj.page ?? 1,
        limit: obj.limit ?? (items.length || 10),
        totalPages: obj.totalPages ?? 1,
      };
    }
  }

  const items = toArray<T>(payload);

  return {
    items,
    total: items.length,
    page: 1,
    limit: items.length || 10,
    totalPages: 1,
  };
}

export const inventoryService = {
  async getByStore(
    storeId: string,
  ): Promise<InventoryItem[]> {
    const { data } = await api.get(
      `/inventory/store/${storeId}`,
    );

    return toArray<InventoryItem>(data);
  },

  async getByVariantAndStore(
    storeId: string,
    variantId: string,
  ): Promise<InventoryItem> {
    const { data } = await api.get(
      `/inventory/store/${storeId}/variant/${variantId}`,
    );

    return toItem<InventoryItem>(data);
  },

  async getLowStock(): Promise<LowStockAlert[]> {
    const { data } = await api.get('/inventory/low-stock');

    return toArray<LowStockAlert>(data);
  },

  async getMovements(filters?: {
    storeId?: string;
    variantId?: string;
    type?: InventoryMovementType;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<InventoryMovement>> {
    const query = buildQuery({
      storeId: filters?.storeId,
      variantId: filters?.variantId,
      type: filters?.type,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    });

    const { data } = await api.get(
      `/inventory/movements${query}`,
    );

    return toPaginatedResponse<InventoryMovement>(data);
  },

  async adjustStock(
    payload: AdjustStockInput,
  ): Promise<InventoryItem> {
    const { data } = await api.post(
      '/inventory/adjust',
      payload,
    );

    return toItem<InventoryItem>(data);
  },

  async transferStock(
    payload: TransferStockInput,
  ): Promise<TransferResult | { message: string }> {
    const { data } = await api.post(
      '/inventory/transfer',
      payload,
    );

    return data;
  },

  async updateInventorySettings(
    payload: UpdateInventorySettingsInput,
  ): Promise<InventoryItem> {
    const {
      storeId,
      variantId,
      minStock,
      maxStock,
    } = payload;

    const { data } = await api.patch(
      `/inventory/settings/${storeId}/${variantId}`,
      {
        minStock,
        maxStock,
      },
    );

    return toItem<InventoryItem>(data);
  },
};