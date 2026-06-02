import { z } from 'zod';

export const generalSettingsSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  currency: z.string().min(1, 'La moneda es requerida'),
  timezone: z.string().min(1, 'La zona horaria es requerida'),
  logoUrl: z.string().optional().nullable(),
});

export const salesSettingsSchema = z.object({
  allowNegativeStock: z.boolean().optional(),
  defaultTax: z.number().optional(),
  invoicePrefix: z.string().optional(),
});

export const inventorySettingsSchema = z.object({
  lowStockThreshold: z.number().optional(),
  trackMovements: z.boolean().optional(),
});

export const tenantSettingsSchema = z.object({
  general: generalSettingsSchema,
  sales: salesSettingsSchema,
  inventory: inventorySettingsSchema,
});

export type TenantSettingsFormData = z.infer<typeof tenantSettingsSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Debes confirmar la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;