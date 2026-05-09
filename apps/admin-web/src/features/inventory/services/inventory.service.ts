import api from '../../../lib/axios';
import type { Inventory, InventoryMovement, PaginatedInventory, InventoryStats } from '../types/inventory.types';
import type { AdjustStockFormData, TransferStockFormData, InventoryFiltersFormData } from '../schemas/inventory.schema';

export const inventoryService = {
  getInventory: async (filters: InventoryFiltersFormData): Promise<PaginatedInventory> => {
    const { data } = await api.get('/inventory', { params: filters });
    return data.data;
  },

  getStats: async (): Promise<InventoryStats> => {
    const { data } = await api.get('/inventory/stats');
    return data.data;
  },

  adjustStock: async (inventoryId: string, payload: AdjustStockFormData): Promise<Inventory> => {
    const { data } = await api.post(`/inventory/${inventoryId}/adjust`, payload);
    return data.data;
  },

  transferStock: async (payload: TransferStockFormData): Promise<void> => {
    await api.post('/inventory/transfer', payload);
  },

  getMovements: async (inventoryId: string): Promise<InventoryMovement[]> => {
    const { data } = await api.get(`/inventory/${inventoryId}/movements`);
    return data.data;
  },
};