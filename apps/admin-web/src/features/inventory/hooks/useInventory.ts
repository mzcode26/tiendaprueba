import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import type { InventoryFiltersFormData, AdjustStockFormData, TransferStockFormData } from '../schemas/inventory.schema';
import { toast } from 'sonner';

export const useInventory = (filters: InventoryFiltersFormData) =>
  useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => inventoryService.getInventory(filters),
  });

export const useInventoryStats = () =>
  useQuery({
    queryKey: ['inventory-stats'],
    queryFn: inventoryService.getStats,
  });

export const useInventoryMovements = (inventoryId: string | null) =>
  useQuery({
    queryKey: ['inventory-movements', inventoryId],
    queryFn: () => inventoryService.getMovements(inventoryId!),
    enabled: !!inventoryId,
  });

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustStockFormData }) =>
      inventoryService.adjustStock(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Stock ajustado'); },
    onError: () => toast.error('Error al ajustar stock'),
  });
};

export const useTransferStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferStockFormData) => inventoryService.transferStock(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Transferencia realizada'); },
    onError: () => toast.error('Error al transferir stock'),
  });
};