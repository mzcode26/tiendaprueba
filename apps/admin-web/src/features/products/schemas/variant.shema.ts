import { z } from 'zod';

export const variantAttributeSchema = z.object({
  attributeId: z.string().min(1, 'El atributo es obligatorio'),
  attributeValueId: z.string().min(1, 'El valor del atributo es obligatorio'),
});

export const variantSchema = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio'),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  compareAtPrice: z.coerce.number().min(0, 'El precio comparativo no puede ser negativo').optional(),
  costPrice: z.coerce.number().min(0, 'El costo no puede ser negativo').optional(),
  isActive: z.boolean().optional().default(true),
  attributes: z.array(variantAttributeSchema).optional().default([]),
});

export const updateVariantSchema = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio').optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo').optional(),
  compareAtPrice: z.coerce.number().min(0, 'El precio comparativo no puede ser negativo').optional(),
  costPrice: z.coerce.number().min(0, 'El costo no puede ser negativo').optional(),
  isActive: z.boolean().optional(),
  attributes: z.array(variantAttributeSchema).optional(),
});

export type VariantFormValues = z.infer<typeof variantSchema>;
export type UpdateVariantFormValues = z.infer<typeof updateVariantSchema>;
export type VariantAttributeFormValues = z.infer<typeof variantAttributeSchema>;