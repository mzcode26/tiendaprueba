import { z } from 'zod';

export const adjustStockSchema = z.object({
  type: z.enum(['PURCHASE', 'ADJUSTMENT', 'LOSS', 'RETURN']),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
  reason: z.string().min(1, 'El motivo es requerido'),
});

export const transferStockSchema = z.object({
  fromStoreId: z.string().min(1, 'Seleccioná la tienda origen'),
  toStoreId: z.string().min(1, 'Seleccioná la tienda destino'),
  productVariantId: z.string().min(1, 'Seleccioná el producto'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
  reason: z.string().optional(),
}).refine(d => d.fromStoreId !== d.toStoreId, {
  message: 'Las tiendas deben ser diferentes',
  path: ['toStoreId'],
});

export const inventoryFiltersSchema = z.object({
  search: z.string().optional(),
  storeId: z.string().optional(),
  lowStock: z.boolean().optional(),
  outOfStock: z.boolean().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type AdjustStockFormData = z.infer<typeof adjustStockSchema>;
export type TransferStockFormData = z.infer<typeof transferStockSchema>;
export type InventoryFiltersFormData = z.infer<typeof inventoryFiltersSchema>;