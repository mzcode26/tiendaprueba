import { z } from 'zod';

export const tenantSettingsSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().min(1, 'La moneda es requerida'),
  timezone: z.string().min(1, 'La zona horaria es requerida'),
});

export const storeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmá la contraseña'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type TenantSettingsFormData = z.infer<typeof tenantSettingsSchema>;
export type StoreFormData = z.infer<typeof storeSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;