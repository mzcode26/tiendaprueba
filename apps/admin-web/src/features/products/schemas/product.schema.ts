import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  sku: z.string().min(1, 'El SKU es requerido'),
  price: z.coerce.number().min(0, 'El precio debe ser mayor a 0'),
  compareAtPrice: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const variantSchema = z.object({
  sku: z.string().min(1, 'El SKU es requerido'),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio debe ser mayor a 0'),
  compareAtPrice: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const brandSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  isActive: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type VariantFormData = z.infer<typeof variantSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type BrandFormData = z.infer<typeof brandSchema>;