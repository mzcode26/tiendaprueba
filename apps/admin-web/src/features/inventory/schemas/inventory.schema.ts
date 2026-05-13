import { z } from 'zod';

export const inventoryFiltersSchema = z.object({
  storeId: z.string().optional(),

  search: z
    .string()
    .trim()
    .optional(),

  lowStock: z.boolean().optional(),

  outOfStock: z.boolean().optional(),

  page: z.number().min(1).optional(),

  limit: z.number().min(1).max(100).optional(),
});

export const adjustStockSchema = z.object({
  storeId: z
    .string()
    .min(1, 'La sucursal es obligatoria'),

  variantId: z
    .string()
    .min(1, 'La variante es obligatoria'),

  type: z.enum(
    ['ADD', 'REMOVE', 'SET'],
    {
      required_error:
        'Selecciona un tipo de ajuste',
    },
  ),

  quantity: z
    .number({
      required_error:
        'La cantidad es obligatoria',
    })
    .min(
      0,
      'La cantidad no puede ser negativa',
    ),

  reason: z
    .string()
    .trim()
    .max(
      255,
      'La observación no puede superar los 255 caracteres',
    )
    .optional(),

  reference: z
    .string()
    .trim()
    .max(
      100,
      'La referencia no puede superar los 100 caracteres',
    )
    .optional(),
});

export const transferStockSchema = z.object({
  fromStoreId: z
    .string()
    .min(
      1,
      'La sucursal origen es obligatoria',
    ),

  toStoreId: z
    .string()
    .min(
      1,
      'La sucursal destino es obligatoria',
    ),

  variantId: z
    .string()
    .min(
      1,
      'La variante es obligatoria',
    ),

  quantity: z
    .number({
      required_error:
        'La cantidad es obligatoria',
    })
    .positive(
      'La cantidad debe ser mayor a cero',
    ),

  reason: z
    .string()
    .trim()
    .max(
      255,
      'La observación no puede superar los 255 caracteres',
    )
    .optional(),

  reference: z
    .string()
    .trim()
    .max(
      100,
      'La referencia no puede superar los 100 caracteres',
    )
    .optional(),
}).refine(
  (data) =>
    data.fromStoreId !== data.toStoreId,
  {
    message:
      'La sucursal origen y destino no pueden ser iguales',
    path: ['toStoreId'],
  },
);

export const inventorySettingsSchema =
  z.object({
    storeId: z
      .string()
      .min(
        1,
        'La sucursal es obligatoria',
      ),

    variantId: z
      .string()
      .min(
        1,
        'La variante es obligatoria',
      ),

    minStock: z
      .number({
        required_error:
          'El stock mínimo es obligatorio',
      })
      .min(
        0,
        'El stock mínimo no puede ser negativo',
      ),
  });

export type InventoryFiltersFormValues =
  z.infer<
    typeof inventoryFiltersSchema
  >;

export type AdjustStockFormValues =
  z.infer<
    typeof adjustStockSchema
  >;

export type TransferStockFormValues =
  z.infer<
    typeof transferStockSchema
  >;

export type InventorySettingsFormValues =
  z.infer<
    typeof inventorySettingsSchema
  >;