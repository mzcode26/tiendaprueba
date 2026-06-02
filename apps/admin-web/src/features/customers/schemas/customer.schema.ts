import { z } from 'zod';

const optionalText = z.string().optional().or(z.literal(''));

export const customerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: optionalText,
  address: optionalText,
  city: optionalText,
  province: optionalText,
  postalCode: optionalText,
  taxId: optionalText,
  birthDate: optionalText,
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional().or(z.literal('')),
  notes: optionalText,
  isActive: z.boolean().default(true),
});

export type CustomerFormData = z.infer<typeof customerSchema>;