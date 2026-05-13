import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  adjustStockSchema,
  type AdjustStockFormValues,
} from '../schemas/inventory.schema';

import type { InventoryItem } from '../types/inventory.types';

interface AdjustStockModalProps {
  open: boolean;
  item: InventoryItem | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdjustStockFormValues) => void | Promise<void>;
}

export function AdjustStockModal({
  open,
  item,
  isLoading = false,
  onClose,
  onSubmit,
}: AdjustStockModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      storeId: '',
      variantId: '',
      type: 'ADD',
      quantity: 0,
      reason: '',
      reference: '',
    },
  });

  const adjustmentType = watch('type');

  useEffect(() => {
    if (open && item) {
      reset({
        storeId: item.storeId,
        variantId: item.variantId,
        type: 'ADD',
        quantity: 0,
        reason: '',
        reference: '',
      });
    }
  }, [open, item, reset]);

  if (!open || !item) return null;

  const productName =
    item.variant?.productName ??
    item.variant?.product?.name ??
    'Producto';

  const variantName =
    item.variant?.variantName ??
    item.variant?.name ??
    item.variant?.sku ??
    'Sin variante';

  const storeName = item.store?.name ?? 'Sucursal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Ajustar stock
            </h3>
            <p className="text-sm text-gray-500">
              {productName} — {variantName} — {storeName}
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
          <input type="hidden" {...register('storeId')} />
          <input type="hidden" {...register('variantId')} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tipo de ajuste
            </label>
            <select
              {...register('type')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
            >
              <option value="ADD">Agregar stock</option>
              <option value="REMOVE">Quitar stock</option>
              <option value="SET">Establecer stock</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">
                {errors.type.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cantidad
            </label>
            <input
              type="number"
              min={0}
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

          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            {adjustmentType === 'ADD' && (
              <p>La cantidad se sumará al stock actual.</p>
            )}
            {adjustmentType === 'REMOVE' && (
              <p>La cantidad se restará del stock actual.</p>
            )}
            {adjustmentType === 'SET' && (
              <p>La cantidad ingresada será el nuevo stock final.</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Observación
            </label>
            <textarea
              rows={3}
              {...register('reason')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
              placeholder="Motivo del ajuste"
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-500">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Referencia
            </label>
            <input
              type="text"
              {...register('reference')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
              placeholder="Factura, remito, nota interna..."
            />
            {errors.reference && (
              <p className="mt-1 text-sm text-red-500">
                {errors.reference.message}
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
              {isLoading ? 'Guardando...' : 'Guardar ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}