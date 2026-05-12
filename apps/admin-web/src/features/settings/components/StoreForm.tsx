import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  storeSchema,
  type StoreFormValues,
} from '../schemas/store.schema';
import type { Store } from '../types/settings.types';

interface StoreFormProps {
  initialData?: Store;
  isLoading?: boolean;
  onSubmit: (values: StoreFormValues) => void | Promise<void>;
}

export function StoreForm({
  initialData,
  isLoading = false,
  onSubmit,
}: StoreFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name ?? '',
        address: initialData.address ?? '',
        phone: initialData.phone ?? '',
        email: initialData.email ?? '',
        isActive: initialData.isActive,
      });
    } else {
      reset({
        name: '',
        address: '',
        phone: '',
        email: '',
        isActive: true,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
          placeholder="Sucursal Central"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <input
          type="text"
          {...register('address')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
          placeholder="Av. Principal 123"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="text"
          {...register('phone')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
          placeholder="+54 381 000000"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          {...register('email')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
          placeholder="sucursal@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label className="text-sm font-medium text-gray-700">
          Sucursal activa
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}