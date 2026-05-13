import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  transferStockSchema,
  type TransferStockFormValues,
} from '../schemas/inventory.schema';

import type { InventoryItem } from '../types/inventory.types';
import type { Store } from '../../settings/types/settings.types';

interface TransferStockModalProps {
  open: boolean;
  item: InventoryItem | null;
  stores: Store[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: TransferStockFormValues) => void | Promise<void>;
}

export function TransferStockModal({
  open,
  item,
  stores,
  isLoading = false,
  onClose,
  onSubmit,
}: TransferStockModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      fromStoreId: '',
      toStoreId: '',
      variantId: '',
      quantity: 0,
      notes: '',
    },
  });

  const fromStoreId = watch('fromStoreId');

  useEffect(() => {
    if (open && item) {
      reset({
        fromStoreId: item.storeId,
        toStoreId: '',
        variantId: item.variantId,
        quantity: 0,
        notes: '',
      });
    }
  }, [open, item, reset]);

  if (!open || !item) return null;

  const destinationStores = stores.filter(
    (store) => store.id !== fromStoreId && store.isActive,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Transferir stock
            </h3>
            <p className="text-sm text-gray-500">
              {item.variant?.productName ?? item.variant?.product?.name ?? 'Producto'} —{' '}
              {item.variant?.variantName ?? item.variant?.name ?? item.variant?.sku ?? 'Sin variante'} —{' '}
              {item.store?.name ?? 'Sucursal origen'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('fromStoreId')} />
          <input type="hidden" {...register('variantId')} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sucursal destino
            </label>
            <select
              {...register('toStoreId')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
            >
              <option value="">Seleccionar sucursal</option>
              {destinationStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            {errors.toStoreId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.toStoreId.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cantidad a transferir
            </label>
            <input
              type="number"
              min={1}
              step="1"
              {...register('quantity', {
                valueAsNumber: true,
              })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Observación
            </label>
            <textarea
              rows={3}
              {...register('notes')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
              placeholder="Motivo de la transferencia"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-500">
                {errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Transferir stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}