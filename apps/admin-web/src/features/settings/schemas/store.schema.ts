import { z } from 'zod';

export const storeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),

  address: z
    .string()
    .trim()
    .max(200, 'La dirección no puede superar los 200 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),

  phone: z
    .string()
    .trim()
    .max(30, 'El teléfono no puede superar los 30 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),

  email: z
    .string()
    .trim()
    .email('Email inválido')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),

  isActive: z.boolean().default(true),
});

export type StoreFormValues = z.infer<typeof storeSchema>;